import { FlaskConical, SendHorizonal } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { useState } from "react"
import { aiAPI } from "../lib/api-config"
import { toast } from "sonner"
import { importCanvasFromJSON } from "../lib/fabric-canvas-utils"
import * as fabric from 'fabric'

interface AiButtonProps {
    canvasRef?: fabric.Canvas
}

export const AiButton = ({
    canvasRef
}: AiButtonProps) => {

    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        if (!canvasRef) {
            toast.error('Please wait for canvas to initialize')
            return
        }
        if (!prompt.trim()) {
            toast.error('Please enter a prompt')
            return
        }

        setIsGenerating(true)
        try {

            const response = await aiAPI.generateDesign(prompt)

            console.log("fabric data: ", response.data.fabricJSON)

            if (response.success && response.data.fabricJSON) {
                const fabricJSON = Array.isArray(response.data.fabricJSON)
                    ? response.data.fabricJSON[0]
                    : response.data.fabricJSON

                if (!canvasRef) {
                    throw new Error('Canvas not available')
                }

                // Check if the JSON is in the expected format (has canvas property)
                // If not, wrap it in the expected format
                const jsonToImport = fabricJSON.canvas ? fabricJSON : {
                    version: '1.0.0',
                    name: 'AI Generated Design',
                    createdAt: new Date().toISOString(),
                    canvas: fabricJSON,
                    metadata: {
                        totalObjects: fabricJSON.objects?.length || 0,
                        exportDate: new Date().toISOString(),
                        app: 'Fizzle AI'
                    }
                }

                await importCanvasFromJSON(canvasRef, jsonToImport, {
                    clearCanvas: true
                })
                toast.success('Design generated successfully!')
                setPrompt('')
            } else {
                throw new Error('Invalid response format')
            }
        } catch (error) {
            console.error('Error generating design:', error)
            toast.error('Failed to generate design. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (

        <div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button disabled={!canvasRef} className="rounded-full size-[60px] bg-gradient-to-br from-blue-500  to-blue-700 text-white flex justify-center items-center">
                        <FlaskConical className=" size-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className=" !text-center">
                        <DialogTitle>Design with AI</DialogTitle>
                        <DialogDescription>
                            Describe what you want to create and let AI help you generate it.
                        </DialogDescription>
                    </DialogHeader>

                    {
                        isGenerating ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                {/* LOADING */}

                                <div className="flex flex-col justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                                        <rect width="10" height="10" x="1" y="1" fill="#6366f1" rx="1">
                                            <animate id="svgSpinnersBlocksShuffle30" fill="freeze" attributeName="x" begin="0;svgSpinnersBlocksShuffle3b.end" dur="0.2s" values="1;13" />
                                            <animate id="svgSpinnersBlocksShuffle31" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle38.end" dur="0.2s" values="1;13" />
                                            <animate id="svgSpinnersBlocksShuffle32" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle39.end" dur="0.2s" values="13;1" />
                                            <animate id="svgSpinnersBlocksShuffle33" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle3a.end" dur="0.2s" values="13;1" />
                                        </rect>
                                        <rect width="10" height="10" x="1" y="13" fill="#f59e42" rx="1">
                                            <animate id="svgSpinnersBlocksShuffle34" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle30.end" dur="0.2s" values="13;1" />
                                            <animate id="svgSpinnersBlocksShuffle35" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle31.end" dur="0.2s" values="1;13" />
                                            <animate id="svgSpinnersBlocksShuffle36" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle32.end" dur="0.2s" values="1;13" />
                                            <animate id="svgSpinnersBlocksShuffle37" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle33.end" dur="0.2s" values="13;1" />
                                        </rect>
                                        <rect width="10" height="10" x="13" y="13" fill="#10b981" rx="1">
                                            <animate id="svgSpinnersBlocksShuffle38" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle34.end" dur="0.2s" values="13;1" />
                                            <animate id="svgSpinnersBlocksShuffle39" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle35.end" dur="0.2s" values="13;1" />
                                            <animate id="svgSpinnersBlocksShuffle3a" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle36.end" dur="0.2s" values="1;13" />
                                            <animate id="svgSpinnersBlocksShuffle3b" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle37.end" dur="0.2s" values="1;13" />
                                        </rect>
                                    </svg>
                                    <div className=" text-xl mt-3 text-gray-500">Generating Your design...</div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4 relative">
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe what you want to create..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isGenerating}
                                />

                                <Button 
                                onClick={handleGenerate}
                                className=" rounded-full size-[50px] absolute bottom-6 right-2">
                                    <SendHorizonal/>
                                </Button>
                            </div>

                        )
                    }


                    {/* <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white"
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim() || !canvasRef}
                        >
                            {isGenerating ? (
                                <>
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </Button>
                    </DialogFooter> */}

                </DialogContent>
            </Dialog>

        </div>

    )
}
