export type StaffInfo = {
  username: string;
  displayUsername: string;
};

export type TableQuery = {
  page: number;
  limit: number;
  q: string;
  staff: string;
  lang: string;
  status: string;
  isNew: string;
  oktWm: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type TableMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isOwner: boolean;
};

export type ManhwaEntry = {
  uuid: string;
  userId: string;
  title: string;
  totalCh: number;
  lang: string;
  isNew: number;
  link: string;
  oktWm: number;
  insertedAt: string;
  approved: number;
  staff?: StaffInfo;
};

export type DoujinEntry = {
  uuid: string;
  userId: string;
  title: string;
  totalPage: number;
  lang: string;
  link: string;
  insertedAt: string;
  approved: number;
  staff?: StaffInfo;
};