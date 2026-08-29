import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Gift, Loader2 } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function GiftReminder() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { products } = useCatalog();
  const { formatPrice } = useCurrency();
  const [suggestions, setSuggestions] = useState<Record<string, any[]>>({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      setIsConnected(true);
      try {
        const timeMin = new Date().toISOString();
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=20&orderBy=startTime&singleEvents=true`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        let data;
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        const textRes = await res.text();
        try {
          data = JSON.parse(textRes);
        } catch (e) {
          data = {};
        }
        
        if (!data.items) {
           setError('No events found or failed to fetch.');
           setLoading(false);
           return;
        }

        // Filter events containing "birthday", "anniversary", etc.
        const upcomingEvents = data.items?.filter((e: any) => 
          e.summary?.toLowerCase().includes('birthday') || 
          e.summary?.toLowerCase().includes('anniversary') ||
          e.summary?.toLowerCase().includes('wedding')
        ) || [];

        // if none match, just show the next few events for demo purposes
        const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : data.items?.slice(0, 3) || [];
        setEvents(displayEvents);

        if (displayEvents.length > 0) {
          fetchSuggestions(displayEvents);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch calendar events.');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error(errorResponse);
      setError('OAuth login failed.');
    },
  });

  const fetchSuggestions = async (calendarEvents: any[]) => {
    setIsSuggesting(true);
    try {
      const newSuggestions: Record<string, any[]> = {};
      
      for (const ev of calendarEvents) {
        const prompt = `Suggest exactly 2 gift items from this catalog for an event called "${ev.summary}". 
        Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category }))) }. 
        Respond with ONLY a JSON array of string IDs.`;

        try {
          const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt, history: [] })
          });
          const data = await response.json();
          let matchedIds: string[] = [];
          try {
             const cleanedText = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
             matchedIds = JSON.parse(cleanedText);
          } catch(e) {
             matchedIds = products.sort(() => 0.5 - Math.random()).slice(0, 2).map(p => p.id);
          }
          
          newSuggestions[ev.id] = products.filter(p => matchedIds.includes(p.id)).slice(0, 2);
        } catch (e) {
          newSuggestions[ev.id] = products.sort(() => 0.5 - Math.random()).slice(0, 2);
        }
      }
      setSuggestions(newSuggestions);
    } catch(err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-[#121216] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-blue-500" /> AI Gift Reminders
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect Google Calendar to get AI gift suggestions 7 days before upcoming birthdays or events.
          </p>
        </div>
        {!isConnected && (
          <button 
            onClick={() => login()}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center whitespace-nowrap"
          >
            Connect Calendar
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-sm">Syncing events & analyzing gifts...</p>
        </div>
      )}
      
      {error && <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">{error}</div>}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {events.map(ev => {
            const eventDate = new Date(ev.start?.dateTime || ev.start?.date || Date.now());
            const daysUntil = Math.max(0, Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
            
            return (
              <div key={ev.id} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{ev.summary}</h4>
                    <p className="text-sm text-gray-500">{eventDate.toLocaleDateString()} • In {daysUntil} days</p>
                  </div>
                  {daysUntil <= 7 && (
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Soon
                    </span>
                  )}
                </div>

                {isSuggesting && !suggestions[ev.id] && (
                   <div className="flex items-center text-sm text-gray-500 py-2">
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Curating perfect gifts...
                   </div>
                )}
                
                {suggestions[ev.id] && suggestions[ev.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                     <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center">
                        <Gift className="w-4 h-4 mr-2" /> Suggested Gifts
                     </p>
                     <div className="space-y-3">
                       {suggestions[ev.id].map(p => (
                          <div key={p.id} className="flex items-center bg-white dark:bg-[#1a1a20] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-purple-500/30 transition-colors cursor-pointer">
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg mr-3 bg-gray-50" />
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                               <p className="text-xs text-gray-500 font-medium">{formatPrice(p.price)}</p>
                            </div>
                          </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
