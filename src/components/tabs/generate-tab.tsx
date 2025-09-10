import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { X, LucidePlus, LucideSettings2, Loader2, ChevronDown, ChevronRight, Brain, ArrowDown, RotateCcw } from "lucide-react";

import { Send } from "iconsax-reactjs";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { aiAPI, type ParsedStreamData } from "../../lib/api-config";
import * as fabric from 'fabric';
import { useTabState } from "../../hooks/useTabState";
import { DesignRollback } from "../design-rollback";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  reasoning?: string; // Add reasoning field for AI messages
  designPreview?: {
    fabricJSON: unknown;
    status: 'pending' | 'accepted' | 'declined';
  };
};

/* const initialMessages: Message[] = [
  {
    id: 2,
    text: "I need a vibrant and energetic poster for a summer music festival called 'Sun-soaked Beats'.",
    sender: "user",
  },

  {
    id: 1,
    text: "Hi there! What kind of design are you looking to create today?",
    sender: "ai",
  },
];
 */
interface GenerateTabProps {
  onClosePanel: () => void;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
  currentCanvasSize?: { width: number; height: number };
  onFabricJSONUpdate?: (fabricJSON: unknown) => void;
  canvasRef?: fabric.Canvas | null;
}

export function GenerateTab({
  onClosePanel,
  onFabricJSONUpdate,
  canvasRef,
}: GenerateTabProps) {
  const { tabStates, updateTabState } = useTabState();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showRollbackPanel, setShowRollbackPanel] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get state from context
  const { messages, inputValue, expandedReasoning, showScrollButton, designHistory } = tabStates.generate;

  // Canvas Preview Component
  const CanvasPreview = ({ fabricJSON }: { fabricJSON: unknown }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!fabricJSON || !canvasRef.current) return;

      const initializeCanvas = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Clean up existing canvas
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
            fabricCanvasRef.current = null;
          }

          // Create new fabric canvas with read-only settings
          const canvas = new fabric.Canvas(canvasRef.current!, {
            width: 200,
            height: 150,
            backgroundColor: '#ffffff',
            selection: false,
            interactive: false,
            allowTouchScrolling: false,
            preserveObjectStacking: true,
            // Disable all interactions
            skipTargetFind: true,
            skipOffscreen: false,
          });

          // Disable all object interactions
          canvas.forEachObject((obj) => {
            obj.set({
              selectable: false,
              evented: false,
              hoverCursor: 'default',
              moveCursor: 'default',
              hasControls: false,
              hasBorders: false,
              hasRotatingPoint: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true,
              lockUniScaling: true,
            });
          });

          fabricCanvasRef.current = canvas;

          // Load the fabric JSON
          const fabricData = fabricJSON as Record<string, unknown>;
          
          if (!fabricData || !fabricData.objects) {
            throw new Error('Invalid fabric JSON data');
          }

          // Calculate proper scaling to fit all content
          const originalWidth = (fabricData.width as number) || 800;
          const originalHeight = (fabricData.height as number) || 600;
          const previewWidth = 200;
          const previewHeight = 150;

          const scaleX = previewWidth / originalWidth;
          const scaleY = previewHeight / originalHeight;
          const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

          // Set canvas background
          if (fabricData.backgroundColor) {
            canvas.backgroundColor = fabricData.backgroundColor as string;
          }

          // Load objects with proper scaling
          await new Promise<void>((resolve, reject) => {
            try {
              canvas.loadFromJSON(fabricData, () => {
                try {
                  // Scale all objects to fit the preview
                  canvas.getObjects().forEach((obj) => {
                    obj.set({
                      scaleX: (obj.scaleX || 1) * scale,
                      scaleY: (obj.scaleY || 1) * scale,
                      left: (obj.left || 0) * scale,
                      top: (obj.top || 0) * scale,
                      // Ensure objects are not interactive
                      selectable: false,
                      evented: false,
                      hoverCursor: 'default',
                      moveCursor: 'default',
                      hasControls: false,
                      hasBorders: false,
                      hasRotatingPoint: false,
                      lockMovementX: true,
                      lockMovementY: true,
                      lockRotation: true,
                      lockScalingX: true,
                      lockScalingY: true,
                      lockUniScaling: true,
                    });
                  });

                  // Center the content if it's smaller than the preview
                  const bounds = canvas.getObjects().reduce((acc, obj) => {
                    const objBounds = obj.getBoundingRect();
                    return {
                      minX: Math.min(acc.minX, objBounds.left),
                      minY: Math.min(acc.minY, objBounds.top),
                      maxX: Math.max(acc.maxX, objBounds.left + objBounds.width),
                      maxY: Math.max(acc.maxY, objBounds.top + objBounds.height),
                    };
                  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

                  if (bounds.minX !== Infinity) {
                    const contentWidth = bounds.maxX - bounds.minX;
                    const contentHeight = bounds.maxY - bounds.minY;
                    
                    if (contentWidth < previewWidth && contentHeight < previewHeight) {
                      const offsetX = (previewWidth - contentWidth) / 2 - bounds.minX;
                      const offsetY = (previewHeight - contentHeight) / 2 - bounds.minY;
                      
                      canvas.getObjects().forEach((obj) => {
                        obj.set({
                          left: (obj.left || 0) + offsetX,
                          top: (obj.top || 0) + offsetY,
                        });
                      });
                    }
                  }

                  canvas.renderAll();
                  setIsLoading(false);
                  resolve();
                } catch (renderError) {
                  console.error('Error rendering canvas:', renderError);
                  reject(renderError);
                }
              });
            } catch (loadError) {
              console.error('Error loading fabric JSON:', loadError);
              reject(loadError);
            }
          });

        } catch (err) {
          console.error('Canvas initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load design preview');
          setIsLoading(false);
        }
      };

      initializeCanvas();

      // Cleanup function
      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    }, [fabricJSON]);

    if (error) {
      return (
        <div className="w-[200px] h-[150px] border border-red-200 rounded shadow-sm bg-red-50 flex items-center justify-center">
          <div className="text-center p-2">
            <div className="text-red-500 text-xs mb-1">⚠️</div>
            <div className="text-xs text-red-600 font-medium">Preview Error</div>
            <div className="text-xs text-red-500 mt-1">{error}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 w-[200px] h-[150px] border border-gray-200 rounded shadow-sm bg-white flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading preview...</span>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-[200px] h-[150px] border border-gray-200 rounded shadow-sm bg-white"
          style={{ cursor: 'default' }}
        />
      </div>
    );
  };

  // Design Preview Component
  const DesignPreview = ({ fabricJSON, messageId }: { fabricJSON: unknown; messageId: number }) => {

    const handleAccept = () => {
      if (onFabricJSONUpdate && fabricJSON) {
        onFabricJSONUpdate(fabricJSON);
        
        // Find the user message that triggered this design to get the prompt
        const userMessage = messages.find((msg: Message) => msg.id === messageId - 1);
        const prompt = userMessage?.text || "AI Generated Design";
        
        // Save to design history
        const newHistoryItem = {
          id: `design_${Date.now()}`,
          fabricJSON: fabricJSON,
          prompt: prompt,
          timestamp: Date.now()
        };
        
        updateTabState('generate', {
          messages: messages.map((msg: Message) => 
            msg.id === messageId 
              ? { ...msg, designPreview: { ...msg.designPreview!, status: 'accepted' as const } }
              : msg
          ),
          designHistory: [newHistoryItem, ...designHistory]
        });
      }
    };

    const handleDecline = () => {
      // Update message status
      updateTabState('generate', {
        messages: messages.map((msg: Message) => 
          msg.id === messageId 
            ? { ...msg, designPreview: { ...msg.designPreview!, status: 'declined' as const } }
            : msg
        )
      });
    };

    const handleRetry = () => {
      // Remove the current message and trigger a new generation
      updateTabState('generate', {
        messages: messages.filter((msg: Message) => msg.id !== messageId)
      });
      
      // Find the user message that triggered this design
      const userMessage = messages.find((msg: Message) => msg.id === messageId - 1);
      if (userMessage && userMessage.sender === 'user') {
        // Trigger new generation with the same prompt
        const fakeEvent = {
          preventDefault: () => {},
        } as FormEvent;
        handleSendMessage(fakeEvent, userMessage.text);
      }
    };

    return (
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-xs font-medium text-gray-600">Design Preview</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex gap-3 items-start flex-col">
            <div className="flex-shrink-0 self-center">
              <CanvasPreview fabricJSON={fabricJSON} />
            </div>
            
            <div className="flex-1 w-full">
              <p className="text-xs text-gray-600 mb-3 text-center">
                Here's what your design will look like. Would you like to apply it to your canvas?
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-7"
                >
                  ✓ Accept
                </Button>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-1 h-7 border-blue-300 hover:bg-blue-50 text-blue-600"
                >
                  🔄 Retry
                </Button>
                <Button
                  onClick={handleDecline}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-1 h-7 border-gray-300 hover:bg-gray-50"
                >
                  ✗ Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rollback handlers
  const handleRollback = (fabricJSON: unknown) => {
    if (onFabricJSONUpdate && fabricJSON) {
      onFabricJSONUpdate(fabricJSON);
    }
  };

  const handlePreviewRollback = (fabricJSON: unknown) => {
    // For now, just apply the preview - in a full implementation, 
    // you might want to show a temporary preview
    if (onFabricJSONUpdate && fabricJSON) {
      onFabricJSONUpdate(fabricJSON);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 0);
    }
  }, [messages, streamingMessage]);

  // Additional effect to scroll when streaming message changes
  useEffect(() => {
    if (streamingMessage && scrollAreaRef.current) {
      // Smooth scroll during streaming
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 50);
    }
  }, [streamingMessage]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        updateTabState('generate', { showScrollButton: false });
      }
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        updateTabState('generate', { showScrollButton: !isAtBottom });
      }
    }
  };

  const toggleReasoning = (messageId: number) => {
    const newSet = new Set(expandedReasoning);
    if (newSet.has(messageId)) {
      newSet.delete(messageId);
    } else {
      newSet.add(messageId);
    }
    updateTabState('generate', { expandedReasoning: newSet });
    // Scroll to bottom after expanding/collapsing reasoning
    setTimeout(scrollToBottom, 100);
  };

  const handleSendMessage = async (e: FormEvent, retryPrompt?: string) => {
    e.preventDefault();
    const messageText = retryPrompt || inputValue.trim();
    if (messageText === "" || isLoading) return;

    const userMessage = messageText;
    const newUserMessage: Message = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
    };

    // Update messages state immediately to show user message
    const updatedMessages = [...messages, newUserMessage];
    updateTabState('generate', {
      messages: updatedMessages,
      inputValue: retryPrompt ? inputValue : ""
    });
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Build the messages array for the API using updated messages
      const apiMessages = updatedMessages.map((msg: Message) => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.text
      }));

      // Get current canvas content if available
      let currentCanvasContent = "";
      if (canvasRef) {
        try {
          const canvasJSON = canvasRef.toJSON();
          currentCanvasContent = `\n\nCurrent canvas content (fabricJSON):\n${JSON.stringify(canvasJSON, null, 2)}`;
        } catch (error) {
          console.warn("Failed to get canvas content:", error);
        }
      }

      // Replace the last message (user message) with canvas context
      apiMessages[apiMessages.length - 1] = {
        role: "user" as const,
        content: userMessage + currentCanvasContent
      };

      await aiAPI.generateDesignStream(
        apiMessages,
        // onChunk - handle streaming text
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk);
        },
        // onComplete - handle final response
        (data: ParsedStreamData) => {
          // Add the final AI message with reasoning and design preview
          const aiResponse: Message = {
            id: Date.now() + 1,
            text: data.answer,
            sender: "ai",
            reasoning: data.reasoning,
            designPreview: data.fabric_json ? {
              fabricJSON: data.fabric_json,
              status: 'pending' as const
            } : undefined,
          };
          
          updateTabState('generate', {
            messages: [...messages, aiResponse]
          });
          setStreamingMessage("");
          setIsLoading(false);
        },
        // onError - handle errors
        (error: Error) => {
          console.error("API Error:", error);
          const errorMessage: Message = {
            id: Date.now() + 1,
            text: "Sorry, I encountered an error while generating your design. Please try again.",
            sender: "ai",
          };
          updateTabState('generate', {
            messages: [...messages, errorMessage]
          });
          setStreamingMessage("");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an unexpected error. Please try again.",
        sender: "ai",
      };
      updateTabState('generate', {
        messages: [...messages, errorMessage]
      });
      setStreamingMessage("");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[350px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Generate</h2>
          <div className="flex items-center gap-2">
            {designHistory.length > 0 && (
              <Button
                onClick={() => setShowRollbackPanel(!showRollbackPanel)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Design History"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <button
              onClick={onClosePanel}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ROLLBACK PANEL */}
      {showRollbackPanel && (
        <div className="border-b border-gray-200 bg-gray-50">
          <DesignRollback
            designHistory={designHistory}
            onRollback={handleRollback}
            onPreview={handlePreviewRollback}
            onClose={() => setShowRollbackPanel(false)}
          />
        </div>
      )}

      {/* FOR CHATS DISPLAY */}
      <div className="flex-1 overflow-hidden relative h-full">
        <ScrollArea 
          className="h-full" 
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <div className="p-4 space-y-6">
          {messages.length === 0 ? (
            // Welcome message when no messages
            <div className="flex justify-center items-center text-center">
              <div className="rounded-lg px-3 py-2 text-sm text-gray-800 max-w-[85%] text-center">
            
                <div className="text-gray-700">
                  <p className="mb-2">👋 Hi there! I'm Drag, your AI design assistant.</p>
                  <p className="mb-2">I can help you create amazing designs by simply describing what you want. Just tell me about your vision and I'll bring it to life!</p>
                  <p className="text-xs text-gray-500">Try saying something like: "Design a poster for a music festival"</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={` rounded-lg px-3 py-2 text-sm  ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white text-right max-w-[80%]"
                    : "text-left text-gray-800"
                }`}
              >
                {message.text}
                
                {/* Collapsible reasoning section for AI messages */}
                {message.sender === "ai" && message.reasoning && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Brain className="w-3 h-3" />
                      <span>AI Reasoning</span>
                    </div>
                    
                    {message.reasoning.length > 200 ? (
                      // Long reasoning - show preview with expand option
                      <div>
                        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 whitespace-pre-wrap">
                          {expandedReasoning.has(message.id) 
                            ? message.reasoning 
                            : `${message.reasoning.substring(0, 200)}...`
                          }
                        </div>
                        <button
                          onClick={() => toggleReasoning(message.id)}
                          className="mt-1 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          {expandedReasoning.has(message.id) ? (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-3 h-3" />
                              <span>Show more</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      // Short reasoning - show full text
                      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 whitespace-pre-wrap">
                        {message.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Design Preview for AI messages */}
                {message.sender === "ai" && message.designPreview && message.designPreview.status === 'pending' && (
                  <DesignPreview 
                    fabricJSON={message.designPreview.fabricJSON} 
                    messageId={message.id} 
                  />
                )}

                {/* Status indicators for accepted/declined designs */}
                {message.sender === "ai" && message.designPreview && message.designPreview.status !== 'pending' && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {message.designPreview.status === 'accepted' ? (
                          <>
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xs text-green-600 font-medium">Design applied to canvas</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Design declined</span>
                          </>
                        )}
                      </div>
                      {message.designPreview.status === 'accepted' && (
                        <Button
                          onClick={() => handleRollback(message.designPreview!.fabricJSON)}
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 h-6 border-blue-300 hover:bg-blue-50 text-blue-600"
                          title="Rollback to this design"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))
          )}
          
          {/* Show streaming message */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="rounded-lg px-3 py-2 text-sm text-left text-gray-800 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
                <div className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                  {streamingMessage}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Brain className="w-3 h-3" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
            size="sm"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* INPUT SIDE */}
      <div className="border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-3 items-end flex-col">
          <textarea
            value={inputValue}
            onChange={(e) => updateTabState('generate', { inputValue: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Describe your design..."
            className="w-full resize-none rounded-lg border border-gray-300 p-2 pr-10 text-sm outline-none border-none scrollbar-hide"
            rows={1}
          />

          <div className="w-full flex justify-between items-center gap-2">
            <div>
              <Button disabled className="bg-inherit text-blue">
                <LucidePlus />
              </Button>
              <Button disabled className="bg-inherit text-blue">
                <LucideSettings2 />
                Tools
              </Button>
            </div>

            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-gray-100 rounded-full size-8 text-blue-600 hover:bg-gray-200 text-2xl flex justify-center items-center p-0 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={25} variant="Bold" />
              )}
            </Button>
          </div>

          {/* <input className=" rounded-md p-2 w-full bg-white" placeholder="Describe your design here..." type="text" /> */}
          </div>
        </form>
      </div>
    </div>
  );
}
