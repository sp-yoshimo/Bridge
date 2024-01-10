//特別な型定義用

import { Profile, Member, Team, Group, Online, Quiz, Question, Choice } from "@prisma/client";

export type TeamWithAuthorAndMembers = Team & {
    author: Profile,
    members: Member[],
    online: Online | null
}

export type TeamWithMembersWithProfile = Team & {
    members: (Member & {
        profile: Profile
    })[]
}

// グループ管理用型
export type GroupManagementType = Team & {
    groups: (Group & {
        members: (Member & {
            profile: Profile
        })[]
    })[],
    members: (Member & {
        profile: Profile
    })[],
    online: Online | null
}


//クイズ用型
export type QuizincludesChildren = Quiz & {
    questions: (Question & {
        choices: Choice[]
    })[]
}