type MemberRegistrationType = "INVITE" | "GROUP";
type MemberStatusType = "ACTIVE" | "BANNED" | "DELETED";
export type Member = {
  id: string;
  login: string;
  status: MemberStatusType;
  registrationType: MemberRegistrationType;
};

export type MembersTableProps = {
  members: Member[];
};

