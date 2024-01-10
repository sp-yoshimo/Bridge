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


const ExplainCreateQuizModal = () => {

    const { isOpen, onClose, data, type } = useModal();

    const isModalOpen = isOpen && type === "explainCreateQuizModal";


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
                        作成したクイズを使用できる条件について
                    </DialogDescription>
                </DialogHeader>

                <div className=" p-5 pb-10 px-10 w-full flex justify-center">
                    <ul className=" text-start text-xl space-y-3">
                        <li>
                            クイズ内に問題が1問以上あること
                        </li>
                        <Separator />
                        <li>
                            それぞれの問題に問題文が与えられていること
                        </li>
                        <Separator />
                        <li>
                            <p>
                                それぞれの問題に選択肢が与えられていること
                            </p>
                            <p className=" text-sm text-muted-foreground">
                                (正解の選択肢も用意する必要がある)
                            </p>
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default ExplainCreateQuizModal;
