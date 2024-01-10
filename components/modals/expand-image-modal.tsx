"use client"

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal";
import Image from "next/image";


const ExpandImageModal = () => {

    const { isOpen, onClose, data, type } = useModal();

    const isModalOpen = isOpen && type === "expandImageModal";
    const { imageUrl } = data;

    
    if(!imageUrl){
        return null;
    }
    

    return (
        <Dialog 
        onOpenChange={onClose}
        open={isModalOpen}>
            <DialogContent
                className=" aspect-video w-full overflow-hidden"
            >
                <Image
                    alt="image"
                    className=" object-cover"
                    fill
                    src={imageUrl}
                />
            </DialogContent>        
        </Dialog>
    )
};

export default ExpandImageModal;
