import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VideoCallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  currentUserId?: string;
  peerLabel?: string;
  onCompleted?: () => void | Promise<void>;
}

type CallState = 'intro' | 'preparing' | 'waiting' | 'connecting' | 'active' | 'ended' | 'error';

type SignalPayload =
  | { type: 'ready'; userId: string }
  | { type: 'offer'; userId: string; offer: RTCSessionDescriptionInit }
  | { type: 'answer'; userId: string; answer: RTCSessionDescriptionInit }
  | { type: 'ice'; userId: string; candidate: RTCIceCandidateInit }
  | { type: 'hangup'; userId: string };

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  isOpen,
  onClose,
  conversationId,
  currentUserId,
  peerLabel,
  onCompleted,
}) => {
  const [callState, setCallState] = useState<CallState>('intro');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [channelReady, setChannelReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const localJoinedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !conversationId || !currentUserId) {
      return undefined;
    }

    setChannelReady(false);
    setCallState('intro');
    setRemoteReady(false);
    setRemoteStreamReady(false);
    setCountdown(60);
    setErrorMessage('');
    completedRef.current = false;
    localJoinedRef.current = false;
    remoteUserIdRef.current = null;

    const channel = supabase
      .channel(`video-call:${conversationId}`, {
        config: {
          broadcast: {
            self: false,
          },
        },
      })
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        void handleSignal(payload as SignalPayload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannelReady(true);
        }
      });

    channelRef.current = channel;

    return () => {
      cleanupResources();
    };
  }, [conversationId, currentUserId, isOpen]);

  useEffect(() => {
    if (callState !== 'active') {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          void finishCompletedCall();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [callState]);

  const cleanupResources = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    remoteStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteStreamReady(false);
    setChannelReady(false);
    setRemoteReady(false);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const sendSignal = async (payload: SignalPayload) => {
    if (!channelRef.current) {
      return;
    }

    await channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload,
    });
  };

  const attachLocalStream = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      await localVideoRef.current.play().catch(console.error);
    }

    return stream;
  };

  const createPeerConnection = async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const connection = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = connection;

    const localStream = await attachLocalStream();
    localStream.getTracks().forEach((track) => connection.addTrack(track, localStream));

    remoteStreamRef.current = new MediaStream();

    connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current?.addTrack(track);
      });

      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        void remoteVideoRef.current.play().catch(console.error);
      }

      setRemoteStreamReady(true);
    };

    connection.onicecandidate = (event) => {
      if (event.candidate && currentUserId) {
        void sendSignal({
          type: 'ice',
          userId: currentUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;

      if (state === 'connected') {
        setCallState('active');
      }

      if (state === 'failed' || state === 'disconnected') {
        setCallState('error');
        setErrorMessage('A conexao da videochamada foi interrompida.');
      }
    };

    return connection;
  };

  const shouldCreateOffer = (otherUserId: string) => {
    if (!currentUserId) {
      return false;
    }

    return currentUserId.localeCompare(otherUserId) < 0;
  };

  const maybeCreateOffer = async (otherUserId: string) => {
    if (!localJoinedRef.current || !shouldCreateOffer(otherUserId)) {
      return;
    }

    const connection = await createPeerConnection();

    if (connection.localDescription) {
      return;
    }

    setCallState('connecting');
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    if (!currentUserId) {
      return;
    }

    await sendSignal({
      type: 'offer',
      userId: currentUserId,
      offer,
    });
  };

  const handleSignal = async (payload: SignalPayload) => {
    if (!isOpen || !currentUserId || payload.userId === currentUserId) {
      return;
    }

    if (payload.type === 'ready') {
      remoteUserIdRef.current = payload.userId;
      setRemoteReady(true);
      await maybeCreateOffer(payload.userId);
      return;
    }

    if (!localJoinedRef.current) {
      return;
    }

    if (payload.type === 'offer') {
      remoteUserIdRef.current = payload.userId;
      setRemoteReady(true);
      setCallState('connecting');
      const connection = await createPeerConnection();
      await connection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      await sendSignal({
        type: 'answer',
        userId: currentUserId,
        answer,
      });
      return;
    }

    if (payload.type === 'answer' && peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(payload.answer)
      );
      return;
    }

    if (payload.type === 'ice' && peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (reason) {
        console.error('Erro ao adicionar ICE candidate:', reason);
      }
      return;
    }

    if (payload.type === 'hangup') {
      setCallState('ended');
      window.setTimeout(() => {
        cleanupResources();
        onClose();
      }, 1500);
    }
  };

  const handleJoinCall = async () => {
    if (!conversationId || !currentUserId || !channelReady) {
      setErrorMessage('A videochamada ainda nao esta pronta. Tente novamente em instantes.');
      setCallState('error');
      return;
    }

    try {
      setErrorMessage('');
      setCallState('preparing');
      await attachLocalStream();
      localJoinedRef.current = true;
      setCallState(remoteReady ? 'connecting' : 'waiting');
      await sendSignal({ type: 'ready', userId: currentUserId });

      if (remoteUserIdRef.current) {
        await maybeCreateOffer(remoteUserIdRef.current);
      }
    } catch (reason) {
      console.error('Erro ao iniciar videochamada:', reason);
      setCallState('error');
      setErrorMessage('Nao foi possivel acessar camera e microfone.');
    }
  };

  const finishCompletedCall = async () => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    await onCompleted?.();
    await handleHangup();
  };

  const handleHangup = async () => {
    if (currentUserId) {
      await sendSignal({ type: 'hangup', userId: currentUserId });
    }

    setCallState('ended');
    window.setTimeout(() => {
      cleanupResources();
      onClose();
    }, 1500);
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((previous) => !previous);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff((previous) => !previous);
  };

  if (!isOpen) {
    return null;
  }

  if (!conversationId || !currentUserId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[230] bg-black/70 backdrop-blur-sm">
      {(callState === 'intro' || callState === 'preparing' || callState === 'waiting' || callState === 'connecting' || callState === 'error') && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-[28px] w-full max-w-[360px] px-6 pt-8 pb-6 flex flex-col items-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                cleanupResources();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="w-[88px] h-[88px] bg-[#FFF0F5] rounded-full flex items-center justify-center mb-6">
              {callState === 'preparing' || callState === 'connecting' ? (
                <Loader2 className="text-[#FF4081] animate-spin" size={40} strokeWidth={2} />
              ) : (
                <Video className="text-[#FF4081]" size={40} strokeWidth={2} />
              )}
            </div>

            <h1 className="text-[#111827] font-bold text-[20px] leading-tight text-center mb-3 tracking-tight px-2">
              Videochamada segura
            </h1>

            <p className="text-[#6B7280] text-[15px] text-center leading-relaxed px-4 mb-6">
              {callState === 'intro' &&
                `Entre na chamada para falar com ${peerLabel || 'a outra pessoa'} durante 1 minuto.`}
              {callState === 'preparing' && 'Preparando camera e microfone...'}
              {callState === 'waiting' && 'Voce entrou. Aguardando a outra pessoa entrar na chamada.'}
              {callState === 'connecting' && 'Conectando os dois participantes...'}
              {callState === 'error' && errorMessage}
            </p>

            {callState === 'waiting' && (
              <p className="text-xs text-pink-500 font-medium mb-6">
                {remoteReady ? 'A outra pessoa entrou. Finalizando conexao...' : 'Canal pronto para receber o outro participante.'}
              </p>
            )}

            {callState === 'intro' && (
              <button
                onClick={() => void handleJoinCall()}
                disabled={!channelReady}
                className="w-full bg-[#FF4081] hover:bg-[#F50057] active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-xl text-[16px] shadow-[0_4px_12px_rgba(255,64,129,0.25)] mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {channelReady ? 'Entrar na videochamada' : 'Preparando canal...'}
              </button>
            )}

            {callState !== 'intro' && (
              <button
                onClick={() => void handleHangup()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-[15px] transition-colors"
              >
                Cancelar chamada
              </button>
            )}
          </div>
        </div>
      )}

      {callState === 'active' && (
        <div className="fixed inset-0 z-[231] bg-black flex flex-col" onClick={(event) => event.stopPropagation()}>
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
            <div className="text-white bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Ao vivo com {peerLabel || 'participante'}
            </div>
            <div className="text-white text-sm font-semibold bg-black/30 px-3 py-1 rounded-full">
              {countdown}s
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-gray-900">
            {remoteStreamReady ? (
              <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
            ) : (
              <div className="text-white text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                <p>Aguardando video remoto...</p>
              </div>
            )}

            <div className="absolute right-4 bottom-28 w-32 h-44 rounded-2xl overflow-hidden border border-white/20 bg-black/50 shadow-xl">
              <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            </div>
          </div>

          <div className="h-24 bg-gray-900 flex items-center justify-center gap-6 px-6 pb-6">
            <button
              onClick={toggleMute}
              className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={() => void handleHangup()}
              className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
            >
              <PhoneOff size={32} />
            </button>

            <button
              onClick={toggleVideo}
              className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          </div>
        </div>
      )}

      {callState === 'ended' && (
        <div className="fixed inset-0 z-[231] bg-white flex flex-col items-center justify-center" onClick={(event) => event.stopPropagation()}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-800 font-bold text-xl mb-2">Chamada encerrada</p>
          <p className="text-gray-500">A etapa foi registrada nesta conversa.</p>
        </div>
      )}
    </div>
  );
};
