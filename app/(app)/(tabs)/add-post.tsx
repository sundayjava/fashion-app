import { Redirect } from 'expo-router';
import React from 'react';

export default function AddPostTab() {
  // Redirect to the actual add-post screen outside tabs
  return <Redirect href="/(app)/(post)/add-post" />;
}
