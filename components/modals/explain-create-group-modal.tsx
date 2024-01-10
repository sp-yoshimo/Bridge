"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal";
import { Separator } from "@/components/ui/separator";


const ExplainCreateGroupModal = () => {

    const { isOpen, onClose, data, type } = useModal();

    const isModalOpen = isOpen && type === "explainCreateGroupModal";


    return (
        <Dialog
            onOpenChange={onClose}
            open={isModalOpen}>
            <DialogContent
                className=" w-full overflow-hidden p-0"
            >
                <DialogHeader className="pt-5">
                    <DialogTitle className=" text-2xl text-center font-bold">
                        注意
                    </DialogTitle>
                    <DialogDescription className=" text-center w-3/4 mx-auto">
                        作成したグループ達を使用できる条件について
                    </DialogDescription>
                </DialogHeader>

                <div className=" p-5 pb-10 px-10 w-full flex justify-center">
                    <ul className=" text-start text-xl space-y-3">
                        <li>
                            グループに最低2人以上いること
                        </li>
                        <Separator />
                        <li>
                            違うグループに同じメンバーがいないこと
                        </li>
                        <Separator />
                        <li>
                            全生徒メンバーが必ずどこかのグループに属していること
                        </li>
                        <Separator />
                        <li>
                            最低でも1つのグループは存在すること
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default ExplainCreateGroupModal;
