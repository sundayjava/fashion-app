import { AddNotes } from '@/components/screens/notes';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AddNoteScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const measurementId = id ? parseInt(id, 10) : undefined;
    
    return <AddNotes measurementId={measurementId} />
}