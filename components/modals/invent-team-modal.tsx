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
import { Team } from "@prisma/client";


const formScheme = z.object({
    code: z.string().min(1, {
        message: "参加コードを入力してください"
    })
})

type formSchemeType = z.infer<typeof formScheme>;


const CreateTeamModal = () => {

    const { isOpen, onClose, type, onOpen } = useModal();
    const isModalOpen = isOpen && type === "inventTeamModal";

    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            code: ""
        }
    });

    const onSubmit = async (values: formSchemeType) => {
        try {

            const response = await axios.post("/api/team/invite", values);
            form.reset();
            onClose();

            const team: Team = response.data

            toast({
                title: `「${team.name}」に参加しました`
            })

            router.refresh();
            router.push(`/dashboard/teams/${team.id}`);
            router.refresh();


        } catch (error: any) {
            toast({
                title: error.response.data,
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
                                    チームに参加
                                </DialogTitle>
                                <DialogDescription className=" text-center w-3/4 mx-auto">
                                    参加コードを入力してチームに参加しましょう
                                </DialogDescription>
                            </DialogHeader>
                            <div className=" p-8">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>参加コード</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className=" w-full focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                    placeholder="参加コードを入力"
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
                                        参加
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
