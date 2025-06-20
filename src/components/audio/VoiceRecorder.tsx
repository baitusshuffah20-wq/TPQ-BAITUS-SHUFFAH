'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onUpload?: (audioFile: File) => void;
  maxDuration?: number; // in seconds
  className?: string;
  title?: string;
  description?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onUpload,
  maxDuration = 300, // 5 minutes default
  className = '',
  title = 'Perekam Suara',
  description = 'Rekam hafalan atau audio lainnya'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setHasPermission(true);
      setError('');
      return stream;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      setError('Akses mikrofon ditolak. Silakan berikan izin untuk merekam audio.');
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await requestMicrophonePermission();
    if (!stream) return;

    streamRef.current = stream;
    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      
      // Create audio URL for playback
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (onRecordingComplete) {
        onRecordingComplete(blob, recordingTime);
      }

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return newTime;
      });
    }, 1000);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            if (newTime >= maxDuration) {
              stopRecording();
              return maxDuration;
            }
            return newTime;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setRecordingTime(0);
    setIsPlaying(false);
    setError('');
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioBlob(file);
      
      if (onUpload) {
        onUpload(file);
      }
    } else {
      setError('Silakan pilih file audio yang valid');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-gray-500">
              Maksimal: {formatTime(maxDuration)}
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={hasPermission === false}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="h-5 w-5 mr-2" />
                Mulai Rekam
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Lanjutkan
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Jeda
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  variant="outline"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Berhenti
                </Button>
              </>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {isPaused ? 'Dijeda' : 'Merekam...'}
              </span>
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Playback</h4>
              
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>

                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-xs text-gray-500">Vol:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-2">
              <Button
                onClick={downloadAudio}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={resetRecording}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              <Button
                onClick={() => setAudioBlob(null)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Upload Audio</h4>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Pilih File Audio
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <MicOff className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Permission Status */}
        {hasPermission === false && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Izin Mikrofon Diperlukan</p>
              <p>Silakan berikan izin akses mikrofon untuk dapat merekam audio.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
