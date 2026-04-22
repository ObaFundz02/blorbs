import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, wallet, score } = req.body;

    await supabase.from("leaderboard").insert([
      { name, wallet, score },
    ]);

    return res.status(200).json({ success: true });
  }
}
