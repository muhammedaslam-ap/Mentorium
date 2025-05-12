"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {  ArrowLeft, Loader, Plus, Trash2, Save, HelpCircle, AlertCircle, CheckCircle} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { quizService } from "@/services/quizServices/quizServices"
import { lessonService } from "@/services/lessonServices/lessonServices"
import Header from "../../../components/header"
import Sidebar from "../../../components/sideBar"

interface Lesson {
  _id: string
  title: string
  description: string
  courseId: string
}

const AddQuizPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [sidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(true)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null)
  const [errors, setErrors] = useState<{
    question?: string
    options?: string[]
    correctAnswer?: string
  }>({})

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetails()
    }
  }, [lessonId])

  const fetchLessonDetails = async () => {
    setLoadingLesson(true)
    try {
      const response = await lessonService.getLesson(lessonId!)
      if (response.success && response.lesson) {
        setLesson(response.lesson)
      } else {
        toast.error("Lesson not found")
        navigate("/tutor/courses")
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error)
      toast.error("Failed to load lesson details")
    } finally {
      setLoadingLesson(false)
    }
  }

  const validateForm = () => {
    const newErrors: {
      question?: string
      options?: string[]
      correctAnswer?: string
    } = {}
    let isValid = true

    // Validate question
    if (!question.trim()) {
      newErrors.question = "Question is required"
      isValid = false
    }

    // Validate options
    const optionErrors: string[] = []
    let hasEmptyOption = false

    options.forEach((option, index) => {
      if (!option.trim()) {
        optionErrors[index] = "Option cannot be empty"
        hasEmptyOption = true
        isValid = false
      }
    })

    if (hasEmptyOption) {
      newErrors.options = optionErrors
    }

    // Check for duplicate options
    const uniqueOptions = new Set(options.map(opt => opt.trim()))
    if (uniqueOptions.size !== options.length) {
      newErrors.options = options.map((option, index) => {
        if (options.findIndex(o => o.trim() === option.trim()) !== index && option.trim()) {
          return "Duplicate option"
        }
        return optionErrors[index] || ""
      })
      isValid = false
    }

    // Validate correct answer
    if (!correctAnswer) {
      newErrors.correctAnswer = "Please select the correct answer"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    } else {
      toast.error("Maximum 6 options allowed")
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)

    // Clear error for this option if it exists
    if (errors.options && errors.options[index]) {
      const newOptionErrors = [...errors.options]
      newOptionErrors[index] = ""
      setErrors({ ...errors, options: newOptionErrors })
    }
  }

  const confirmDeleteOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("Quiz must have at least 2 options")
      return
    }
    setOptionToDelete(index)
    setShowDeleteDialog(true)
  }

  const handleDeleteOption = () => {
    if (optionToDelete !== null) {
      const newOptions = options.filter((_, index) => index !== optionToDelete)
      setOptions(newOptions)

      // If the deleted option was the correct answer, reset the correct answer
      if (correctAnswer === options[optionToDelete]) {
        setCorrectAnswer("")
      }

      setShowDeleteDialog(false)
      setOptionToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)
    try {
      await quizService.addQuiz(lessonId!, {
        question,
        options,
        answer: correctAnswer,
      })

      toast.success("Quiz added successfully")
      navigate(`/tutor/courses/lessons/${lessonId}`)
    } catch (error) {
      console.error("Error adding quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loadingLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className={`flex-1 p-6 ${sidebarOpen ? "md:ml-64" : ""}`}>
            <div className="container mx-auto max-w-3xl">
              <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center">
                  <Loader className="h-12 w-12 text-violet-500 animate-spin mb-4" />
                  <p className="text-violet-700">Loading lesson details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 p-6 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-3xl">
            <Button
              variant="ghost"
              className="mb-6 text-violet-600 hover:text-violet-800 hover:bg-violet-100 -ml-2"
              onClick={() => navigate(`/tutor/courses/lessons/${lessonId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
                Add Quiz
              </h1>
              {lesson && (
                <p className="text-violet-600">
                  Creating quiz for lesson: <span className="font-medium">{lesson.title}</span>
                </p>
              )}
            </div>

            <Card className="border-violet-100 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="text-violet-900">Quiz Details</CardTitle>
                <CardDescription>
                  Create a quiz to test students' understanding of the lesson material.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="question" className="text-violet-800">
                        Question <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your question here"
                        value={question}
                        onChange={(e) => {
                          setQuestion(e.target.value)
                          if (errors.question) {
                            setErrors({ ...errors, question: undefined })
                          }
                        }}
                        className={`min-h-24 ${
                          errors.question ? "border-red-500 focus-visible:ring-red-500" : "border-violet-200"
                        }`}
                      />
                      {errors.question && <p className="text-sm text-red-500 mt-1">{errors.question}</p>}
                    </div>

                    <Separator className="bg-violet-100" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-violet-800">
                          Answer Options <span className="text-red-500">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-violet-200 text-violet-700 hover:bg-violet-100"
                                onClick={handleAddOption}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Option
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add another answer option (max 6)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <RadioGroup
                        value={correctAnswer}
                        onValueChange={(value) => {
                          setCorrectAnswer(value)
                          if (errors.correctAnswer) {
                            setErrors({ ...errors, correctAnswer: undefined })
                          }
                        }}
                        className="space-y-3"
                      >
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 border rounded-md p-2 w-full bg-white">
                              <RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} />
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className={`border-0 focus-visible:ring-0 ${
                                  errors.options && errors.options[index] ? "text-red-500" : ""
                                }`}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-violet-500 hover:text-red-500 hover:bg-red-50"
                                      onClick={() => confirmDeleteOption(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete this option</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      {errors.options && errors.options.some((error) => error) && (
                        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            Please fix the errors in your options. Options cannot be empty or duplicated.
                          </AlertDescription>
                        </Alert>
                      )}

                      {errors.correctAnswer && (
                        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{errors.correctAnswer}</AlertDescription>
                        </Alert>
                      )}

                      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle>Tip</AlertTitle>
                        <AlertDescription>
                          Select the radio button next to the correct answer. You need at least 2 options.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-violet-200 text-violet-700 hover:bg-violet-100"
                      onClick={() => navigate(`/tutor/courses/lessons/${lessonId}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-violet-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-violet-900">Quiz Preview</CardTitle>
                <CardDescription>This is how your quiz will appear to students.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-violet-100 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-violet-900 mb-4">{question || "Your question will appear here"}</h3>

                  {options.length > 0 ? (
                    <RadioGroup value={correctAnswer} className="space-y-3" disabled>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div
                            className={`flex items-center space-x-2 border rounded-md p-3 w-full ${
                              option === correctAnswer ? "bg-green-50 border-green-200" : "bg-gray-50"
                            }`}
                          >
                            <RadioGroupItem value={option} id={`preview-option-${index}`} />
                            <Label htmlFor={`preview-option-${index}`} className="w-full cursor-pointer">
                              {option || `Option ${index + 1} (empty)`}
                            </Label>
                            {option === correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-violet-500 italic">Add some options to see the preview</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Option Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this option? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOption}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddQuizPage
