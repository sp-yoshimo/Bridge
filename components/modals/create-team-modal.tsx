"use client"

import * as z from "zod"
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { useModal } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";


const formScheme = z.object({
    name: z.string().min(1, {
        message: "チーム名は必須です"
    })
})

type formSchemeType = z.infer<typeof formScheme>;


const CreateTeamModal = () => {

    const { isOpen, onClose, type } = useModal();
    const isModalOpen = isOpen && type === "createTeamModal";

    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            name: ""
        }
    });

    const onSubmit = async (values: formSchemeType) => {
        try {

            const response = await axios.post("/api/team", values);
            toast({
                title: "チームを作成しました"
            })
            onClose();

            router.refresh();
            router.push(`/dashboard/teams/${response.data.id}`)
            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        }
    }

    return (
        <Dialog
            onOpenChange={() => {
                form.reset()
                onClose();
            }}
            open={isModalOpen}>
            <DialogContent className=" p-0 overflow-hidden">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader className="pt-5">
                                <DialogTitle className=" text-2xl text-center font-bold">
                                    チームを作成
                                </DialogTitle>
                                <DialogDescription className=" text-center w-3/4 mx-auto">
                                    チームの名前を決めましょう。これは後からでも変更できる設定です。
                                </DialogDescription>
                            </DialogHeader>
                            <div className=" p-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>チーム名</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className=" w-full focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                    placeholder="チーム名を入力"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter className="border-t w-full">
                                <div className="w-full flex justify-between items-center py-3 px-4">
                                    <Button variant="ghost" type="button" onClick={() => {
                                        form.reset();
                                        onClose()
                                    }}>
                                        キャンセル
                                    </Button>
                                    <Button
                                        disabled={form.formState.isSubmitting}
                                        type="submit"
                                        className={`bg-sky-600 text-white hover:bg-sky-700 transition ${form.formState.isSubmitting && "opacity-70"}`}>
                                        作成
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default CreateTeamModal;
