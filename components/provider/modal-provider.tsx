"use client"

import { useEffect, useState } from "react"
import ExpandImageModal from "@/components/modals/expand-image-modal";
import InventTeamModal from "@/components/modals/invent-team-modal";
import CreateTeamModal from "@/components/modals/create-team-modal";
import TeamLeaveModal from "@/components/modals/team-leave-modal";
import CreateGroupModal from "@/components/modals/create-group-modal";
import ExplainCreateGroupModal from "@/components/modals/explain-create-group-modal";
import GroupErrorModal from "@/components/modals/group-error-modal";
import EditGroupModal from "@/components/modals/edit-group-modal";
import StartOnlineModal from "@/components/modals/start-online-modal";
import { EndOnlineModal } from "@/components/modals/end-online-modal";
import StartGroupModal from "@/components/modals/start-group-modal";
import StartTeamModal from "@/components/modals/start-team-modal";
import CreateQuizModal from "@/components/modals/create-quiz-modal";
import ExplainCreateQuizModal from "@/components/modals/explain-create-quiz-modal";
import { QuizModal } from "@/components/modals/quiz-modal";
import { GroupMessage } from "@/components/modals/group-message";


//モーダル群(いつでも画面に表示できるように)
export const ModalProvider = () => {

    //server componentからclient compoenntに移行する際はページがマウントされたかの有無を確認する必要がある
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    },[]);

    if(!isMounted){
        return null;
    }

    return(
        <>
            <ExpandImageModal />
            <InventTeamModal />
            <CreateTeamModal />
            <TeamLeaveModal />
            <CreateGroupModal />
            <ExplainCreateGroupModal />
            <GroupErrorModal />
            <EditGroupModal />
            <StartOnlineModal />
            <EndOnlineModal />
            <StartGroupModal />
            <StartTeamModal />
            <CreateQuizModal />
            <ExplainCreateQuizModal />
            <QuizModal />
            <GroupMessage />
        </>
    )
}