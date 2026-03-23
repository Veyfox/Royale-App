import { Router, type IRouter, type Request, type Response } from "express";
import * as CR from "../lib/clashRoyale.js";

const router: IRouter = Router();

function handleError(res: Response, err: unknown) {
  const e = err as any;
  const status = e?.status ?? 500;
  const message = e?.message ?? "Internal server error";
  res.status(status).json({ error: message, detail: e?.body ?? null });
}

// ─── CLAN ────────────────────────────────────────────────────────────────────

router.get("/clash/clans/search", async (req: Request, res: Response) => {
  try {
    const { name, minScore, maxMembers, minMembers, limit } = req.query as Record<string, string>;
    const data = await CR.searchClans({
      name,
      minScore: minScore ? Number(minScore) : undefined,
      maxMembers: maxMembers ? Number(maxMembers) : undefined,
      minMembers: minMembers ? Number(minMembers) : undefined,
      limit: limit ? Number(limit) : 20,
    });
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/clans/:tag", async (req: Request, res: Response) => {
  try {
    const data = await CR.getClan(req.params.tag);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/clans/:tag/members", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const data = await CR.getClanMembers(req.params.tag, limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/clans/:tag/warlog", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const data = await CR.getClanWarLog(req.params.tag, limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/clans/:tag/currentwar", async (req: Request, res: Response) => {
  try {
    const data = await CR.getClanCurrentWar(req.params.tag);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

// ─── PLAYER ──────────────────────────────────────────────────────────────────

router.get("/clash/players/:tag", async (req: Request, res: Response) => {
  try {
    const data = await CR.getPlayer(req.params.tag);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/players/:tag/battlelog", async (req: Request, res: Response) => {
  try {
    const data = await CR.getPlayerBattleLog(req.params.tag);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/players/:tag/chests", async (req: Request, res: Response) => {
  try {
    const data = await CR.getPlayerUpcomingChests(req.params.tag);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

// ─── RANKINGS ─────────────────────────────────────────────────────────────────

router.get("/clash/rankings/clanwars", async (_req: Request, res: Response) => {
  try {
    const limit = Number(_req.query.limit ?? 20);
    const data = await CR.getGlobalClanWarRankings(limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/rankings/players", async (_req: Request, res: Response) => {
  try {
    const limit = Number(_req.query.limit ?? 20);
    const data = await CR.getGlobalPlayerRankings(limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/clash/rankings/clans", async (_req: Request, res: Response) => {
  try {
    const limit = Number(_req.query.limit ?? 20);
    const data = await CR.getGlobalClanRankings(limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

// ─── CARDS ───────────────────────────────────────────────────────────────────

router.get("/clash/cards", async (_req: Request, res: Response) => {
  try {
    const data = await CR.getCards();
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

// ─── TOURNAMENTS ─────────────────────────────────────────────────────────────

router.get("/clash/tournaments", async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string) ?? "";
    const limit = Number(req.query.limit ?? 20);
    const data = await CR.getTournaments(name, limit);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
