
import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setSearchQuery(transcript);
        
        // If user says "search for X" or "find X", extract the query
        let finalQuery = transcript;
        if (transcript.includes('search for ')) {
          finalQuery = transcript.split('search for ')[1];
        } else if (transcript.includes('find ')) {
          finalQuery = transcript.split('find ')[1];
        }
        
        setSearchQuery(finalQuery);
        onSearch(finalQuery);
        
        toast({
          title: "Voice Search",
          description: `Searching for: "${finalQuery}"`,
        });
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access for voice search to work.",
          });
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      toast({
        variant: "destructive",
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice search functionality.",
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast, onSearch]);
  
  const handleStartListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        
        toast({
          title: "Listening...",
          description: "Speak now to search",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };
  
  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative flex items-center max-w-md w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search analytics..."
          className="pl-10 pr-10 w-full bg-background/50 backdrop-blur-sm border-muted"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={clearSearch}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isSupported && (
        <Button
          type="button"
          size="icon"
          variant={isListening ? "destructive" : "ghost"}
          className="ml-2"
          onClick={isListening ? handleStopListening : handleStartListening}
        >
          <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
        </Button>
      )}
    </form>
  );
};

export default VoiceSearch;
