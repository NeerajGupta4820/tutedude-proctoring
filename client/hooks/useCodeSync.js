import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getStarterCode } from '../utlis/questionpannel/starterCode';

export const useCodeSync = ({
  socket,
  meetingId,
  user,
  question,
  language,
  setLanguage,
  code,
  setCode,
  isInterviewer,
  currentQuestionIndex,
  setTestResults,
}) => {
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  const [lastSyncedBy, setLastSyncedBy] = useState(null);
  const codeUpdateTimeoutRef = useRef(null);
  const lastCodeRef = useRef('');

  // Socket Listeners
  useEffect(() => {
    if (!socket || !meetingId) return;

    const handleCodeSync = (data) => {
      const {
        code: syncedCode,
        language: syncedLanguage,
        fromUserId,
        fromUserName,
        fromUserRole,
        isReset,
      } = data;

      if (fromUserId === user?.id) return;

      console.log(
        `📥 Code sync received from ${fromUserName} (${fromUserRole})`
      );

      setIsRemoteUpdate(true);
      setLastSyncedBy(fromUserName);

      if (isReset) {
        const starterCode = getStarterCode(
          question,
          syncedLanguage || language
        );
        setCode(starterCode);
        lastCodeRef.current = starterCode;
      } else {
        setCode(syncedCode || '');
        lastCodeRef.current = syncedCode || '';
      }

      if (syncedLanguage && syncedLanguage !== language) {
        setLanguage(syncedLanguage);
      }

      setTimeout(() => {
        setIsRemoteUpdate(false);
        setLastSyncedBy(null);
      }, 1000);
    };

    const handleLanguageSync = (data) => {
      const {
        language: syncedLanguage,
        starterCode,
        fromUserId,
        fromUserName,
      } = data;

      if (fromUserId === user?.id) return;

      console.log(
        `🔤 Language sync received: ${syncedLanguage} from ${fromUserName}`
      );

      setIsRemoteUpdate(true);
      setLanguage(syncedLanguage);

      const codeToSet = starterCode || getStarterCode(question, syncedLanguage);
      setCode(codeToSet);
      lastCodeRef.current = codeToSet;

      setTimeout(() => {
        setIsRemoteUpdate(false);
      }, 500);
    };

    const handleOutputSync = (data) => {
      const {
        output: syncedOutput,
        type,
        fromUserId,
        fromUserName,
        fromUserRole,
        shareWithCandidate,
      } = data;

      if (fromUserId === user?.id) return;

      if (isInterviewer) {
        if (fromUserRole === 'candidate') {
          console.log(`📊 Output received from candidate ${fromUserName}`);
          setTestResults(syncedOutput);
          toast.info(
            `${fromUserName} ${type === 'submit' ? 'submitted' : 'ran'} code`
          );
        }
      } else {
        if (fromUserRole === 'admin' && shareWithCandidate) {
          console.log(`📊 Output shared by admin ${fromUserName}`);
          setTestResults(syncedOutput);
        }
      }
    };

    socket.on('code-sync', handleCodeSync);
    socket.on('language-sync', handleLanguageSync);
    socket.on('code-output-sync', handleOutputSync);

    socket.emit('code-request-state', { meetingId });

    return () => {
      socket.off('code-sync', handleCodeSync);
      socket.off('language-sync', handleLanguageSync);
      socket.off('code-output-sync', handleOutputSync);
    };
  }, [
    socket,
    meetingId,
    user?.id,
    language,
    isInterviewer,
    question,
    setCode,
    setLanguage,
    setTestResults,
  ]);

  // Emit code change with debounce
  const emitCodeChange = useCallback(
    (newCode) => {
      if (!socket || !meetingId || isRemoteUpdate) return;

      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }

      codeUpdateTimeoutRef.current = setTimeout(() => {
        socket.emit('code-change', {
          meetingId,
          code: newCode,
          language,
          questionIndex: currentQuestionIndex,
        });
      }, 100);
    },
    [socket, meetingId, language, currentQuestionIndex, isRemoteUpdate]
  );

  // Handle code change
  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode || '');
      lastCodeRef.current = newCode || '';

      if (!isRemoteUpdate) {
        emitCodeChange(newCode);
      }
    },
    [isRemoteUpdate, emitCodeChange, setCode]
  );

  // Handle language change
  const handleLanguageChange = useCallback(
    (newLanguage) => {
      setLanguage(newLanguage);

      const starterCode = getStarterCode(question, newLanguage);
      setCode(starterCode);
      lastCodeRef.current = starterCode;

      if (socket && meetingId) {
        socket.emit('language-change', {
          meetingId,
          language: newLanguage,
          starterCode: starterCode,
          questionIndex: currentQuestionIndex,
        });
      }
    },
    [socket, meetingId, currentQuestionIndex, question, setCode, setLanguage]
  );

  // Reset code
  const handleResetCode = useCallback(() => {
    const starterCode = getStarterCode(question, language);
    setCode(starterCode);
    lastCodeRef.current = starterCode;

    if (socket && meetingId) {
      socket.emit('code-change', {
        meetingId,
        code: starterCode,
        language,
        questionIndex: currentQuestionIndex,
        isReset: true,
      });
    }

    toast.success('Code reset to starter code');
  }, [socket, meetingId, language, currentQuestionIndex, question, setCode]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRemoteUpdate,
    lastSyncedBy,
    lastCodeRef,
    handleCodeChange,
    handleLanguageChange,
    handleResetCode,
  };
};

export default useCodeSync;
