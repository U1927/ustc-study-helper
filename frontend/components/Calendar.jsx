import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import localforage from 'localforage';
export default function Calendar(){
  const [events, setEvents] = useState([]);
  const tokenRef = useRef(null);
  useEffect(()=>{ tokenRef.current = localStorage.getItem('dev-session') }, []);
  useEffect(()=>{ load(); }, []);
  async function load(){
    const t = tokenRef.current;
    if(!t){ setEvents([]); return; }
    try{
      const resp = await axios.get(process.env.NEXT_PUBLIC_API_BASE + '/api/events', { headers: { 'x-session': t }});
      setEvents(resp.data.events.map(e=>({ id: e.id, title: e.title, start: e.startAt, end: e.endAt })));
    }catch(e){
      console.error(e);
    }
  }
  async function handleDateSelect(selectInfo){
    const title = prompt('事件标题:');
    if(!title) return;
    const t = tokenRef.current;
    const newEv = { title, startAt: selectInfo.startStr, endAt: selectInfo.endStr, isTodo: false };
    await axios.post(process.env.NEXT_PUBLIC_API_BASE + '/api/events', newEv, { headers: { 'x-session': t }});
    load();
  }
  return (
    <div>
      <FullCalendar
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView="timeGridWeek"
        selectable={true}
        events={events}
        select={handleDateSelect}
        height={650}
      />
      <p className="mt-2 text-sm text-gray-500">提示：演示版依赖后端 token（x-session）进行 API 调用。</p>
    </div>
  );
}
