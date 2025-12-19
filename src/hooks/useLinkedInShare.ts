import { useState, useEffect, useCallback } from 'react';

interface ShareData {
  profileUrl: string;
  profileName: string;
  shareMessage: string;
}

interface UseLinkedInShareReturn {
  linkedInConnected: boolean;
  isPostingToLinkedIn: boolean;
  handleLinkedInConnect: () => void;
  handleDirectLinkedInPost: (shareData: ShareData) => Promise<void>;
}

const getLinkedInToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  let token = localStorage.getItem('linkedin_token');
  if (!token) return null;

  // Handle URL-encoded tokens (backward compatibility)
  if (token.includes('%')) {
    try {
      const decoded = decodeURIComponent(token);
      localStorage.setItem('linkedin_token', decoded);
      return decoded;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return token;
    }
  }

  return token;
};

export const useLinkedInShare = (): UseLinkedInShareReturn => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [isPostingToLinkedIn, setIsPostingToLinkedIn] = useState(false);

  // Check LinkedIn token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getLinkedInToken();
      const isConnected = !!token && token.length > 20;
      setLinkedInConnected(isConnected);
    }
  }, []);

  // Listen for LinkedIn auth success from popup
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUTH_SUCCESS' && event.data.provider === 'linkedin') {
        if (event.data.token && typeof event.data.token === 'string' && event.data.token.length > 20) {
          localStorage.setItem('linkedin_token', event.data.token);
          setLinkedInConnected(true);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const handleLinkedInConnect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/api/linkedin/auth/start',
      'LinkedIn Authentication',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }, []);

  const handleDirectLinkedInPost = useCallback(async (shareData: ShareData) => {
    if (!shareData) return;

    setIsPostingToLinkedIn(true);

    try {
      const token = getLinkedInToken();

      if (!token) {
        alert('LinkedIn token not found. Please connect your LinkedIn account.');
        setIsPostingToLinkedIn(false);
        return;
      }

      const response = await fetch('/api/linkedin/directShare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          message: shareData.shareMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Successfully shared to LinkedIn!');
      } else if (data.suggestSimpleMethod || response.status === 403) {
        // Copy message to clipboard
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(shareData.shareMessage);
          }
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError);
        }

        // Open LinkedIn share dialog
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.profileUrl)}`;
        window.open(shareUrl, '_blank', 'width=600,height=600');

        alert(
          '📋 Your profile message has been copied to clipboard!\n\n' +
          'LinkedIn share dialog is opening...\n\n' +
          'Please paste the message (Ctrl+V) in the LinkedIn post and click "Post".'
        );
      } else {
        alert(`❌ Failed to share to LinkedIn: ${data.error || 'Unknown error'}\n\nPlease try again or use the "Copy Message" button to share manually.`);
      }
    } catch (error) {
      console.error('❌ Network error posting to LinkedIn:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsPostingToLinkedIn(false);
    }
  }, []);

  return {
    linkedInConnected,
    isPostingToLinkedIn,
    handleLinkedInConnect,
    handleDirectLinkedInPost,
  };
};
