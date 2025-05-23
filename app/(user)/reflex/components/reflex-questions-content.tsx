"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Plus, AlertCircle, BrainCircuit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import QuestionForm from "./question-form"
import DeleteQuestionDialog from "./delete-question-dialog"
import { ReflexQuestion } from "@prisma/client"

export default function ReflexQuestionsContent(
    { questions, userId, error }: { questions: ReflexQuestion[], userId: string, error?: string }
) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // State to track which question is being edited or deleted
    const [editingQuestion, setEditingQuestion] = useState<ReflexQuestion | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<ReflexQuestion | null>(null);
    // Determine if we're in edit mode
    const isEditMode = !!editingQuestion;

    // Refs to store timeout IDs for cleanup
    const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const deleteModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeouts when component unmounts
    useEffect(() => {
        return () => {
            if (modalTimeoutRef.current) {
                clearTimeout(modalTimeoutRef.current);
            }
            if (deleteModalTimeoutRef.current) {
                clearTimeout(deleteModalTimeoutRef.current);
            }
        };
    }, []);

    // Function to handle opening the edit modal
    const handleEditQuestion = (question: ReflexQuestion) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    // Function to handle opening the delete confirmation dialog
    const handleDeleteClick = (question: ReflexQuestion) => {
        setDeletingQuestion(question);
        setIsDeleteModalOpen(true);
    };

    // Function to handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Clear any existing timeout
        if (modalTimeoutRef.current) {
            clearTimeout(modalTimeoutRef.current);
        }
        // Reset editing state after modal is closed
        modalTimeoutRef.current = setTimeout(() => {
            setEditingQuestion(null);
        }, 300); // Small delay to avoid flickering during modal animation
    };

    // Function to handle closing the delete confirmation dialog
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        // Clear any existing timeout
        if (deleteModalTimeoutRef.current) {
            clearTimeout(deleteModalTimeoutRef.current);
        }
        // Store the timeout ID in the ref for cleanup on unmount
        deleteModalTimeoutRef.current = setTimeout(() => {
            setDeletingQuestion(null);
        }, 300);
    };

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!error && questions.length === 0 && (
                <Card className="mb-6 border-dashed">
                    <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No reflex questions yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Create your first question to start practicing thinking and responding quickly.
                            You can generate an AI-suggested answer or write your own.
                        </p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center"
                            size="lg"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create your first question
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!error && questions.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-8 animate-slideInLeft">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="bg-primary p-2 rounded-full relative overflow-hidden"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-primary-foreground/20"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0, 0.3, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                />
                                <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
                            </motion.div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Reflex Questions</h1>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => {
                                    setEditingQuestion(null); // Ensure we're in create mode
                                    setIsModalOpen(true);
                                }}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Plus className="h-4 w-4" /> New Question
                            </Button>
                        </motion.div>
                    </div>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        {questions.map((question) => (
                            <motion.div
                                key={question.id}
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    show: { y: 0, opacity: 1 }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                            >
                                <motion.div
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Card className="overflow-hidden border hover:border-primary/50 transition-all">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="font-bold text-lg leading-tight">{question.question}</CardTitle>
                                                <Badge variant="outline" className="text-xs">
                                                    {new Date(question.createdAt).toLocaleDateString()}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                                                {question.answer}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="bg-muted px-4 flex justify-between items-center border-t">
                                            <DropdownMenu>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs flex items-center gap-1"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                                                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                                                <circle cx="12" cy="12" r="3"></circle>
                                                            </svg>
                                                            Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </motion.div>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer flex items-center gap-2"
                                                        onClick={() => handleEditQuestion(question)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-destructive flex items-center gap-2"
                                                        onClick={() => handleDeleteClick(question)}
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button size="sm" className="flex items-center gap-1" asChild>
                                                    <Link href={`/reflex?question=${question.id}`}>
                                                        Practice
                                                        <motion.svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="ml-1"
                                                            animate={{ x: [0, 3, 0] }}
                                                            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                                                        >
                                                            <path d="M5 12h14" />
                                                            <path d="m12 5 7 7-7 7" />
                                                        </motion.svg>
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}

            {/* Add/Edit question modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? 'Edit Reflex Question' : 'Add New Reflex Question'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? 'Update your question and answer details.'
                                : 'Create a question to practice thinking and responding quickly.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <QuestionForm
                        userId={userId}
                        onCancel={handleCloseModal}
                        onSuccess={handleCloseModal}
                        question={editingQuestion || undefined}
                        mode={isEditMode ? 'edit' : 'create'}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            {deletingQuestion && (
                <DeleteQuestionDialog
                    isOpen={isDeleteModalOpen}
                    questionId={deletingQuestion.id}
                    questionText={deletingQuestion.question}
                    userId={userId}
                    onClose={handleCloseDeleteModal}
                />
            )}
        </>
    )
}