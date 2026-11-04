import { connectDB } from "./db";
import { User } from "@/models/User";
import type { StaffInfo } from "./types";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function staffByDisplayId(ids: string[]) {
  await connectDB();

  const users = await User.find({
    displayId: { $in: [...new Set(ids)] },
  })
    .select("displayId username displayUsername")
    .lean();

  return Object.fromEntries(
    users.map((u) => [
      u.displayId,
      {
        username: u.username,
        displayUsername: u.displayUsername,
      },
    ]),
  ) as Record<string, StaffInfo>;
}

// Mencari staff berdasarkan username atau displayUsername.
// Hanya digunakan oleh API Owner.
export async function findStaffIds(search: string) {
  if (!search.trim()) return [];

  await connectDB();

  const regex = new RegExp(escapeRegex(search.trim()), "i");

  const users = await User.find({
    $or: [
      { username: regex },
      { displayUsername: regex },
    ],
  })
    .select("displayId")
    .lean();

  return users.map((user) => user.displayId);
}