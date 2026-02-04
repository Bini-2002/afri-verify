import re
from dataclasses import dataclass
from typing import Iterable, List, Sequence


_WORD_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> List[str]:
    return _WORD_RE.findall((text or "").lower())


def chunk_text(text: str, *, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []

    if overlap >= chunk_size:
        overlap = max(0, chunk_size // 4)

    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return chunks


@dataclass(frozen=True)
class ScoredChunk:
    chunk_id: str
    score: float


def bm25_rank(
    query: str,
    documents: Sequence[tuple[str, str]],
    *,
    k1: float = 1.5,
    b: float = 0.75,
) -> List[ScoredChunk]:
    """BM25 ranker.

    documents: list of (chunk_id, chunk_text)
    returns: list of ScoredChunk sorted by descending score
    """

    q_tokens = tokenize(query)
    if not q_tokens or not documents:
        return []

    # term freq per doc + doc lengths
    doc_tokens: List[List[str]] = [tokenize(text) for _, text in documents]
    doc_lens = [len(toks) for toks in doc_tokens]
    avgdl = (sum(doc_lens) / len(doc_lens)) if doc_lens else 0.0

    # document frequency per term
    df = {}
    for toks in doc_tokens:
        for t in set(toks):
            df[t] = df.get(t, 0) + 1

    N = len(doc_tokens)

    def idf(term: str) -> float:
        n_q = df.get(term, 0)
        # classic BM25 idf with +1 to avoid negative when term is in many docs
        return max(0.0, (N - n_q + 0.5) / (n_q + 0.5))

    scores: List[ScoredChunk] = []
    for (chunk_id, _), toks, dl in zip(documents, doc_tokens, doc_lens):
        if dl == 0:
            continue
        tf = {}
        for t in toks:
            tf[t] = tf.get(t, 0) + 1

        score = 0.0
        for term in q_tokens:
            f = tf.get(term, 0)
            if f == 0:
                continue
            denom = f + k1 * (1.0 - b + b * (dl / avgdl if avgdl else 0.0))
            score += idf(term) * (f * (k1 + 1.0)) / (denom if denom else 1.0)

        if score > 0:
            scores.append(ScoredChunk(chunk_id=chunk_id, score=score))

    scores.sort(key=lambda s: s.score, reverse=True)
    return scores
