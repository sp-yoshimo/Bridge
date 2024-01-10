import { QuizincludesChildren } from "@/types";
import { Choice, Group, Member, Profile, Question, Quiz, Team } from "@prisma/client";
import { create } from "zustand";

export type ModalType = "expandImageModal" | "createTeamModal" | "inventTeamModal" | "teamLeaveModal" |
    "createGroupModal" | "explainCreateGroupModal" | "groupErrorModal" | "editGroupModal" | "startOnlineModal" |
    "endOnlineModal" | "startGroupModal" | "startTeamModal" | "createQuizModal" | "explainCreateQuizModal" |
    "QuizModal" | "groupMessage"

interface ModalData {
    imageUrl?: string,
    team?: Team;
    teamId?: string;
    member?: Member,
    membersWithProfile?: (Member & {
        profile: Profile
    })[],
    group?: (Group & {
        members: (Member & {
            profile: Profile
        })[]
    }),
    quiz?: QuizincludesChildren,
    isPreview?: boolean;
    message?: string;
}


interface ModalStore {
    type: ModalType | null,
    data: ModalData
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    isOpen: false,
    data: {},
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
    onClose: () => set({ type: null, isOpen: false })
}))