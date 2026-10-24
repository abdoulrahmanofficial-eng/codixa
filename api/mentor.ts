import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ProviderConfig {
  name: string;
  url: string;
  key: string | undefined;
  model: string;
  headers: Record<string, string>;
}

const CF_VISION_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';

function resolveProvider(): ProviderConfig {
  const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const providers: Record<string, ProviderConfig> = {
    cloudflare: {
      name: 'cloudflare',
      url: `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/v1/chat/completions`,
      key: process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN,
      model: process.env.MENTOR_MODEL || CF_VISION_MODEL,
      headers: {},
    },
    google: {
      name: 'google',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      model: process.env.MENTOR_MODEL || 'gemini-2.0-flash',
      headers: {},
    },
    openrouter: {
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.MENTOR_MODEL || 'google/gemini-2.0-flash-exp:free',
      headers: {
        'HTTP-Referer': 'https://codixa-io.vercel.app',
        'X-Title': 'Codixa Mentor',
      },
    },
    zen: {
      name: 'zen',
      url: 'https://opencode.ai/zen/v1/chat/completions',
      key: process.env.OPENCODE_ZEN_API_KEY,
      model: process.env.MENTOR_MODEL || 'nemotron-3.5-super-vl-free',
      headers: {
        'x-opencode-client': 'desktop',
        'x-opencode-project': 'global',
        'x-opencode-request': `msg_${Date.now()}`,
        'x-opencode-session': `ses_${Date.now()}`,
        'User-Agent': 'opencode/1.18.15 ai-sdk/provider-utils/4.0.23 runtime/bun/1.3.14',
      },
    },
  };
  const explicit = process.env.MENTOR_PROVIDER;
  if (explicit && providers[explicit]?.key) return providers[explicit];
  if (providers.cloudflare.key && cfAccount) return providers.cloudflare;
  if (providers.google.key) return providers.google;
  if (providers.openrouter.key) return providers.openrouter;
  return providers.zen;
}

interface Chunk {
  id: string;
  content: string;
  section: string;
  chapter: string;
}

function searchChunks(query: string, chunks: Chunk[], topK = 8): { chunk: Chunk; score: number }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const scored = chunks.map(chunk => {
    const lower = chunk.content.toLowerCase();
    const titleLower = (chunk.section + ' ' + chunk.chapter).toLowerCase();
    let score = 0;
    for (const term of terms) {
      const countInContent = (lower.match(new RegExp(term, 'g')) || []).length;
      const countInTitle = (titleLower.match(new RegExp(term, 'g')) || []).length;
      score += countInContent * 2 + countInTitle * 10;
    }
    score /= Math.log(chunk.content.length + 10);
    return { chunk, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topK).filter(r => r.score > 0);
}

function chunkText(text: string): Chunk[] {
  const lines = text.split('\n');
  const chunks: Chunk[] = [];
  let id = 0;
  let currentContent: string[] = [];
  let currentSection = 'Main Content';
  let currentChapter = '';

  const flush = () => {
    const content = currentContent.join('\n').trim();
    if (content) {
      chunks.push({ id: `kb-${id++}`, content, section: currentSection, chapter: currentChapter });
    }
    currentContent = [];
  };

  for (const line of lines) {
    if (line.startsWith('#')) {
      flush();
      const title = line.replace(/^#+\s*/, '').trim();
      if (line.startsWith('##')) {
        currentSection = title;
      } else if (line.startsWith('# ')) {
        currentChapter = title;
        currentSection = title;
      }
    } else if (line.trim()) {
      currentContent.push(line);
      if (currentContent.join('\n').length > 1000) {
        flush();
        currentSection = currentSection + ' (cont.)';
        currentContent.push(line);
      }
    }
  }
  flush();
  return chunks;
}

const IMAGE_GEN_POLICY = `## Image Generation
When a diagram, flowchart, architecture sketch, or illustration would genuinely help the student understand (for example: "draw a flowchart", "show a diagram of the client-server model", "illustrate how a linked list works"), you MAY generate ONE image by emitting a line on its own, exactly like this:
[[IMAGE: <a detailed, self-contained description of the picture to draw, in English>]]
Rules:
- Emit at most one [[IMAGE: ...]] per reply, on its own line.
- Write the description in English and make it specific and visual (style, layout, labels). Do not put code or long prose inside it.
- Only do this when the student explicitly asks for a picture, OR when a diagram is clearly the best explanation. Do NOT generate images for ordinary questions.`;

function buildSystemPrompt(mode: string, lang: string, subject = 'programming and computer science'): string {
  const modes: Record<string, string> = {
    beginner: 'Explain concepts simply as if teaching a complete beginner. Use analogies and simple language.',
    intermediate: 'Assume the student knows basics. Focus on deeper understanding.',
    advanced: 'Use technical language. Focus on performance, edge cases, and low-level implementation detail.',
    university: 'University-level depth. Include formal definitions, theorems, and proofs.',
    kid: 'Explain like I am 10 years old. Use fun examples and simple words.',
    stepbystep: 'Break down every concept into tiny steps. Guide incrementally.',
    hints: 'Do not give the answer directly. Provide hints and guiding questions.',
    answer: 'Provide a clear final answer with explanation.',
  };

  const langInstruction = 'Respond in the same language the student uses. You are fluent in both English and Arabic.';

  const mathPolicy = `## Strict Mathematical Formatting Rules

You are an expert programming tutor. When you write mathematical notation (complexity like $O(n^2)$, formulas, or logic), the platform renders it with **KaTeX**. Follow these rules EXACTLY. Every output must be validated before sending.

### RULE 1: NEVER mix text and math inside the same display math block
- $$...$$ must contain ONLY mathematical expressions.
- No Arabic or English explanatory text inside $$...$$.
- Explanations must always be OUTSIDE the equation.

**Wrong:**
$$\\text{الناتج هو} \\int x^2 dx$$
**Correct:**
الناتج هو:
$$\\int x^2\\,dx = \\frac{x^3}{3} + C$$

### RULE 2: NEVER place $...$ inside $$...$$
**Wrong:**
$$\\text{هذا هو} $x^2$$$
**Correct:**
هذا هو $x^2$
or
$$x^2$$

### RULE 3: Display equations contain ONLY math
- No Arabic text inside $$...$$
- No English text inside $$...$$
- No $ inside $$...$$
- No nested math delimiters of any kind.

### RULE 4: Use correct delimiters
- Inline math: $...$
- Display math: $$...$$
- DO NOT use \\[ \\] or \\( \\).
- DO NOT nest math environments.
- DO NOT escape math delimiters.

### RULE 5: Supported commands
Use standard LaTeX: \\frac, \\sqrt, \\int, \\sum, \\prod, \\lim, \\sin, \\cos, \\tan, \\sec, \\csc, \\cot, \\ln, \\log, \\exp, \\pi, \\theta, \\alpha, \\beta, \\gamma, \\Delta, \\infty, \\rightarrow, \\Rightarrow, \\cdots and all standard KaTeX-compatible commands.

### RULE 6: Validate BEFORE sending
Check ALL of these:
- No Arabic text inside $$...$$
- No English text inside $$...$$
- No $ inside $$...$$
- No nested math delimiters
- Every $$ has a closing $$
- Every $ has a closing $
- No unmatched braces or parentheses
- No malformed fractions/integrals/superscripts

If ANY rule is violated, regenerate the mathematical formatting.

### Examples

**Correct display:**
$$\\int \\sec^2 x\\,dx = \\tan x + C$$

**Correct inline:**
Since $\\frac{d}{dx}\\tan x = \\sec^2 x$, we can integrate.

**Correct explanation + display:**
Now integrate:
$$\\int \\sec^2 x\\,dx + \\int \\sin x\\,dx$$
We know each integral:
$$\\int \\sec^2 x\\,dx = \\tan x + C$$
$$\\int \\sin x\\,dx = -\\cos x + C$$
Therefore:
$$\\tan x - \\cos x + C$$

## Retrieved Context Fidelity Policy

### Core Rules
1. The retrieved context is the single source of truth.
2. Never invent, rewrite, normalize, or "correct" mathematical expressions.
3. Any mathematical expression, LaTeX, Markdown equation, code block, or formula found in the context MUST be copied EXACTLY as it appears.
4. Treat every mathematical expression as immutable text.
5. Do not change: variables, exponents, symbols, parentheses, fractions, integral signs, Greek letters, LaTeX commands.
6. Never replace one equation with another even if you think it is incorrect.
7. Never infer missing mathematical symbols.
8. Never simplify or reformat equations unless the user explicitly requests formatting only.

### Math Copy Policy
If the retrieved context contains:
$$\\int (5+6x-4x^3)\\,dx$$
You MUST reproduce it character-for-character before solving it.
Do NOT output: \\int(5+6x-34x)dx or any modified form.

### When solving
1. Quote the original problem exactly.
2. Then solve it.
3. If any mathematical expression is unreadable or incomplete in the retrieved context, state that it is unreadable.
4. Never guess missing symbols.

### Priority
Retrieved Context > User Assumptions > Model Knowledge
If your internal knowledge conflicts with the retrieved context, follow the retrieved context exactly.`;

  return `You are Codixa Mentor, an expert private tutor inside the Codixa learning platform. Your specialization is "${subject}".

ADAPTATION LEVEL — the student selected "**${mode}**". You MUST strictly obey this level in tone, depth, vocabulary, and examples (do not ignore it):
${modes[mode] || modes.intermediate}

${langInstruction}

CORE RULES:
- You are a programming and computer-science expert covering ALL languages and areas, including (but not limited to): HTML/CSS, JavaScript/TypeScript (React, Node.js, etc.), Python, Java, C/C++/C#, Go, Rust, PHP, Ruby, SQL and databases, data structures and algorithms, operating systems, networking and security, mobile (Flutter/React Native/Android/iOS), AI and machine learning, and DevOps/tools.
- Answer any programming or computer-science question in these areas. For anything unrelated to programming or computer science, politely say: "I can only help with programming and computer-science questions."
- Teach clearly with examples and step-by-step reasoning. Never give only the final answer — guide the student.
- When a Knowledge Base Context is provided below, treat it as the authoritative source for that material and reproduce any code or formulas from it exactly.
- If the student sends an image (a photo or screenshot of code, an error message, or a problem), read it carefully, transcribe it exactly, then explain and fix it.
- Adapt to the student's level, and detect and correct misconceptions.

${mathPolicy}

${IMAGE_GEN_POLICY}

RESPONSE FORMAT:
- Use Markdown.
- Break explanations into sections with headings.
- Put code inside fenced code blocks with the correct language name.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, mode = 'intermediate', language = 'en', topK = 4, kbText, userName, userGoals } = req.body || {};
    const lastContent = messages?.[messages.length - 1]?.content;
    const userMsg = typeof lastContent === 'string'
      ? lastContent
      : Array.isArray(lastContent)
        ? lastContent.filter((p: any) => p?.type === 'text').map((p: any) => p.text).join(' ')
        : '';
    const hasImage = Array.isArray(lastContent) && lastContent.some((p: any) => p?.type === 'image_url');

    if (!userMsg && !hasImage) {
      res.status(400).json({ error: 'No message provided' });
      return;
    }

    const provider = resolveProvider();
    if (!provider.key) {
      res.status(500).json({ error: 'Mentor API key not configured on server' });
      return;
    }

    // RAG — turns on only when the client provides an uploaded document
    const chunks = kbText ? chunkText(kbText) : [];
    const results = searchChunks(userMsg, chunks, topK);
    const kbLoaded = chunks.length > 0;

    let ragContext = '';
    if (results.length > 0) {
      ragContext = results.map((r, i) =>
        `[${i + 1}] ${r.chunk.section}: ${r.chunk.content.slice(0, 350)}`
      ).join('\n\n');
    } else if (kbLoaded) {
      ragContext = chunks.slice(0, 2).map((c, i) =>
        `[${i + 1}] ${c.section}: ${c.content.slice(0, 300)}`
      ).join('\n\n');
    }

    const subject = kbText ? 'your uploaded document' : 'programming and computer science';
    let systemContent = buildSystemPrompt(mode, language, subject);
    if (userName) {
      const goalsLine = userGoals ? ` He wants to learn: ${userGoals}.` : '';
      systemContent += `\n\n**Student Profile:** You are tutoring ${userName}.${goalsLine} Greet him by name and personalize the experience.`;
    }
    if (ragContext) {
      systemContent += `\n\n**Knowledge Base Context (reference this to inform your answers):**\n${ragContext}`;
      if (results.length > 0) {
        systemContent += `\n\n**Relevant Sources:**\n${results.map((r, i) => `${i + 1}. **${r.chunk.section}**${r.chunk.chapter ? ' — ' + r.chunk.chapter : ''}`).join('\n')}`;
      }
    }

    const apiMessages = [
      { role: 'system', content: systemContent },
      ...messages.slice(-4).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const citations = kbLoaded ? results.map(r => ({
      source: kbText ? 'Uploaded Document' : 'Calculus Volume 2 — OpenStax',
      chapter: r.chunk.chapter,
      section: r.chunk.section,
      chunkId: r.chunk.id,
      score: Math.round(r.score * 100) / 100,
    })) : [];

    // Cloudflare Workers AI: image requests must use the native /ai/run endpoint
    // (the OpenAI-compatible endpoint only accepts string content).
    const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (provider.name === 'cloudflare' && hasImage && cfAccount) {
      const imagePart = (lastContent as any[]).find((p: any) => p?.type === 'image_url');
      const dataUrl: string = imagePart?.image_url?.url || '';
      const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;
      const convo = apiMessages.slice(1).map((m: any) => {
        const text = typeof m.content === 'string'
          ? m.content
          : (Array.isArray(m.content) ? m.content.filter((p: any) => p?.type === 'text').map((p: any) => p.text).join(' ') : '');
        return `${m.role === 'user' ? 'Student' : 'Mentor'}: ${text}`;
      }).join('\n\n');
      const visionPrompt = `${systemContent}\n\n---\nConversation so far:\n${convo}\n\n---\nThe student attached an image with their latest message. Read it carefully, transcribe any problem exactly as written, then teach and solve it.`;

      const vRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/${CF_VISION_MODEL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key}`,
        },
        body: JSON.stringify({ prompt: visionPrompt, image: base64, stream: true, max_tokens: 4096, temperature: 0.7 }),
      });

      if (!vRes.ok) {
        const errText = await vRes.text();
        console.error('Cloudflare vision error:', vRes.status, errText);
        res.status(500).json({ error: `API error: ${errText}` });
        return;
      }

      const vReader = vRes.body?.getReader();
      if (!vReader) {
        res.status(500).json({ error: 'No response stream' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const vDecoder = new TextDecoder();
      let vBuf = '';
      while (true) {
        const { done, value } = await vReader.read();
        if (done) break;
        vBuf += vDecoder.decode(value, { stream: true });
        const vLines = vBuf.split('\n');
        vBuf = vLines.pop() || '';
        for (const line of vLines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.response || '';
            if (token) res.write(JSON.stringify({ type: 'token', content: token }) + '\n');
          } catch {}
        }
      }

      res.write(JSON.stringify({ type: 'done', citations }) + '\n');
      res.end();
      return;
    }

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        ...provider.headers,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Zen API error:', response.status, errText);
      res.status(500).json({ error: `API error: ${errText}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: 'No response stream' });
      return;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            res.write(JSON.stringify({ type: 'token', content }) + '\n');
          }
        } catch {}
      }
    }

    res.write(JSON.stringify({ type: 'done', citations }) + '\n');
    res.end();
  } catch (e: any) {
    console.error('Mentor API error:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: e.message || 'Internal error' });
    } else {
      res.write(JSON.stringify({ type: 'error', error: e.message || 'Stream error' }) + '\n');
      res.end();
    }
  }
}
