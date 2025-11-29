import { useState, useEffect } from 'react';
import { Camera, Mic, Image, Moon, Sun, Square, Sparkles, Trash2, Mail, Send } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  timestamp: string;
  requestId: string;
}

interface Transcription {
  id: number;
  text: string;
  time: string;
  isFinal: boolean;
}

interface TemplateProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  userId: string;
}

export default function Template({ isDark, setIsDark, userId }: TemplateProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedCount, setRecordedCount] = useState(0);
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [prescriptionEmail, setPrescriptionEmail] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [isSendingPrescription, setIsSendingPrescription] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);

  // Connect to SSE photo stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToPhotoStream = () => {
      try {
        eventSource = new EventSource(`/api/photo-stream?userId=${encodeURIComponent(userId)}`);

        eventSource.onopen = () => {
          console.log('Connected to photo stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Skip connection messages
            if (data.type === 'connected') {
              return;
            }

            // Check if this is a new photo
            setPhotos(prev => {
              if (prev.some(p => p.requestId === data.requestId)) {
                return prev; // Already have this photo
              }

              const newPhoto: Photo = {
                id: data.requestId,
                requestId: data.requestId,
                url: data.dataUrl,
                timestamp: new Date(data.timestamp).toLocaleTimeString()
              };

              return [newPhoto, ...prev].slice(0, 6);
            });
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);

          // Close and reconnect after a delay
          eventSource?.close();
          setTimeout(connectToPhotoStream, 3000);
        };
      } catch (error) {
        console.error('Error connecting to photo stream:', error);
      }
    };

    connectToPhotoStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  // Connect to SSE transcription stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let idCounter = Date.now();

    const connectToTranscriptionStream = () => {
      try {
        eventSource = new EventSource(`/api/transcription-stream?userId=${encodeURIComponent(userId)}`);

        eventSource.onopen = () => {
          console.log('Connected to transcription stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Skip connection messages
            if (data.type === 'connected') {
              return;
            }

            // Only show final transcriptions
            if (data.isFinal) {
              setTranscriptions(prev => [
                {
                  id: idCounter++,
                  text: data.text,
                  time: new Date(data.timestamp).toLocaleTimeString(),
                  isFinal: true
                },
                ...prev
              ].slice(0, 20));
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);

          // Close and reconnect after a delay
          eventSource?.close();
          setTimeout(connectToTranscriptionStream, 3000);
        };
      } catch (error) {
        console.error('Error connecting to transcription stream:', error);
      }
    };

    connectToTranscriptionStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  const handleStartRecording = async () => {
    try {
      if (!userId || userId.trim() === '') {
        console.error('Error: No user ID available');
        return;
      }

      const response = await fetch('/api/transcription/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsRecording(true);
        setSummary(''); // Clear previous summary
        console.log('Started recording transcriptions');
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to start recording: ${error}`);
    }
  };

  const handleStopRecording = async () => {
    try {
      const response = await fetch('/api/transcription/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsRecording(false);
        setRecordedCount(data.status.transcriptionCount);
        console.log(`Stopped recording. Captured ${data.status.transcriptionCount} transcriptions`);
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to stop recording: ${error}`);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      console.log('Generating summary with GPT...');

      const response = await fetch('/api/transcription/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        console.log(`Summary generated (${data.transcriptionCount} transcriptions)`);
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to generate summary: ${error}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleClearTranscriptions = async () => {
    try {
      const response = await fetch('/api/transcription/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary('');
        setRecordedCount(0);
        console.log('Transcriptions cleared');
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to clear transcriptions: ${error}`);
    }
  };

  const handleSendPrescription = async () => {
    if (!prescriptionEmail.trim() || !prescriptionEmail.includes('@')) {
      console.error('Please enter a valid email address');
      return;
    }

    if (!summary || summary.trim().length === 0) {
      console.error('Please generate a summary first');
      return;
    }

    try {
      setIsSendingPrescription(true);
      console.log(`Sending prescription to ${prescriptionEmail}...`);

      const response = await fetch('/api/email/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          email: prescriptionEmail, 
          summary 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Prescription sent to ${prescriptionEmail}`);
        setPrescriptionEmail('');
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to send prescription: ${error}`);
    } finally {
      setIsSendingPrescription(false);
    }
  };

  const handleSendReport = async () => {
    if (!reportEmail.trim() || !reportEmail.includes('@')) {
      console.error('Please enter a valid email address');
      return;
    }

    if (!summary || summary.trim().length === 0) {
      console.error('Please generate a summary first');
      return;
    }

    try {
      setIsSendingReport(true);
      console.log(`Sending report to ${reportEmail}...`);

      const response = await fetch('/api/email/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          email: reportEmail, 
          summary 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Report sent to ${reportEmail}`);
        setReportEmail('');
      } else {
        console.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to send report: ${error}`);
    } finally {
      setIsSendingReport(false);
    }
  };

  // Poll for recording status
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/transcription/status?userId=${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (response.ok) {
          setIsRecording(data.isRecording);
          setRecordedCount(data.transcriptionCount);
        }
      } catch (error) {
        // Silent fail for status polling
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    
    // Initial poll
    pollStatus();

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="relative p-6 space-y-6 max-w-7xl mx-auto">
      {/* Photos Section */}
      <section className="relative rounded-xl backdrop-blur-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="relative p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'var(--icon-bg-cyan)' }}>
              <Camera className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Photo Stream</h2>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Live captures</p>
            </div>
          </div>
          <div className="px-2.5 py-1">
            <span className="text-xs font-medium" style={{ color: 'var(--accent-emerald-muted)' }}>
              {photos.length} captured
            </span>
          </div>
        </div>

        <div className="relative p-4">
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-3 rounded-xl mb-3" style={{ background: 'var(--icon-bg-purple)' }}>
                <Image className="w-8 h-8 opacity-50" style={{ color: 'var(--accent-purple)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Waiting for photo captures...</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Images will appear here in real-time</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="group relative aspect-video rounded-lg overflow-hidden hover:scale-105 transition-all"
                  style={{ animation: 'photoAppear 0.5s ease-out' }}
                >
                  <img
                    src={photo.url}
                    alt={`Captured at ${photo.timestamp}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] text-white font-mono">{photo.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Theme Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-4 rounded-xl transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-center gap-2">
            {isDark ? <Sun className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} /> : <Moon className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />}
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
        </button>
      </div>

      {/* Transcription Controls */}
      <section className="relative rounded-xl backdrop-blur-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="relative p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--icon-bg-emerald)' }}>
                <Mic className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Transcription Recording</h2>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {isRecording ? `Recording... (${recordedCount} captured)` : 'Start recording to accumulate transcriptions'}
                </p>
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-rose)' }}></div>
                <span className="text-xs font-medium" style={{ color: 'var(--accent-rose)' }}>LIVE</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="flex-1 min-w-[150px] p-3 rounded-lg font-medium transition-all"
                style={{
                  background: 'linear-gradient(to bottom right, var(--accent-emerald), var(--accent-cyan))',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Start Recording</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="flex-1 min-w-[150px] p-3 rounded-lg font-medium transition-all"
                style={{
                  background: 'linear-gradient(to bottom right, var(--accent-rose), var(--accent-purple))',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Square className="w-4 h-4 fill-current" />
                  <span className="text-sm">Stop Recording</span>
                </div>
              </button>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={recordedCount === 0 || isGeneratingSummary}
              className="flex-1 min-w-[150px] p-3 rounded-lg font-medium transition-all"
              style={{
                background: recordedCount > 0
                  ? 'linear-gradient(to bottom right, var(--accent-purple), var(--accent-rose))'
                  : 'var(--bg-input)',
                color: recordedCount > 0 ? 'white' : 'var(--text-muted)',
                cursor: recordedCount === 0 ? 'not-allowed' : 'pointer',
                opacity: isGeneratingSummary ? 0.7 : 1
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className={`w-4 h-4 ${isGeneratingSummary ? 'animate-pulse' : ''}`} />
                <span className="text-sm">{isGeneratingSummary ? 'Generating...' : 'Summarize with GPT-5'}</span>
              </div>
            </button>

            {recordedCount > 0 && (
              <button
                onClick={handleClearTranscriptions}
                className="p-3 rounded-lg font-medium transition-all"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--accent-rose)',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Summary Display */}
        {summary && (
          <div className="relative px-4 pb-4 space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>GPT-5 Summary</h3>
              </div>
              <div 
                className="text-sm leading-relaxed" 
                style={{ color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{
                  __html: summary
                    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .split('\n')
                    .map(line => {
                      if (line.trim().match(/^[-*]\s+(.+)$/)) {
                        return `<li style="margin-left: 20px;">${line.trim().substring(2)}</li>`;
                      }
                      return line.trim() ? `<p style="margin: 8px 0;">${line}</p>` : '';
                    })
                    .join('')
                }}
              />
            </div>

            {/* Email Prescription */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Email Prescription</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={prescriptionEmail}
                  onChange={(e) => setPrescriptionEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendPrescription()}
                  placeholder="patient@example.com"
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-secondary)'
                  }}
                />
                <button
                  onClick={handleSendPrescription}
                  disabled={!prescriptionEmail.trim() || isSendingPrescription}
                  className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                  style={{
                    background: prescriptionEmail.trim() && !isSendingPrescription
                      ? 'linear-gradient(to bottom right, var(--accent-cyan), var(--accent-emerald))'
                      : 'var(--bg-card)',
                    color: prescriptionEmail.trim() && !isSendingPrescription
                      ? 'white'
                      : 'var(--text-muted)',
                    cursor: !prescriptionEmail.trim() || isSendingPrescription ? 'not-allowed' : 'pointer',
                    opacity: isSendingPrescription ? 0.7 : 1
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Send className={`w-4 h-4 ${isSendingPrescription ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{isSendingPrescription ? 'Sending...' : 'Send Prescription'}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Report */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Email Report</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReport()}
                  placeholder="patient@example.com"
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-secondary)'
                  }}
                />
                <button
                  onClick={handleSendReport}
                  disabled={!reportEmail.trim() || isSendingReport}
                  className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                  style={{
                    background: reportEmail.trim() && !isSendingReport
                      ? 'linear-gradient(to bottom right, var(--accent-purple), var(--accent-rose))'
                      : 'var(--bg-card)',
                    color: reportEmail.trim() && !isSendingReport
                      ? 'white'
                      : 'var(--text-muted)',
                    cursor: !reportEmail.trim() || isSendingReport ? 'not-allowed' : 'pointer',
                    opacity: isSendingReport ? 0.7 : 1
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Send className={`w-4 h-4 ${isSendingReport ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{isSendingReport ? 'Sending...' : 'Send Report'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Full Transcriptions */}
      <section className="relative rounded-xl backdrop-blur-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--icon-bg-cyan)' }}>
                <Mic className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Complete Transcriptions</h2>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Final transcribed text only</p>
              </div>
            </div>
            <div className="px-2.5 py-1">
              <span className="text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}>
                {transcriptions.length} captured
              </span>
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-4 max-h-96 overflow-y-auto custom-scrollbar">
          {transcriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-flex p-3 rounded-xl mb-3" style={{ background: 'var(--icon-bg-cyan)' }}>
                <Mic className="w-8 h-8 opacity-50" style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>No transcriptions yet</p>
              <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-tertiary)' }}>
                {isRecording ? 'Listening for speech...' : 'Start recording to capture transcriptions'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcriptions.map(trans => (
                <div
                  key={trans.id}
                  className="p-4 rounded-lg transition-all hover:scale-[1.01]"
                  style={{
                    animation: 'slideDown 0.3s ease-out',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-cyan)' }}></div>
                    <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--accent-cyan)' }}>{trans.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{trans.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes photoAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--border-secondary);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--icon-bg-purple);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent-purple);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
