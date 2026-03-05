# Setting Up Google Places API for Location Search

## Overview
The location search feature uses Google Places API to provide real-time location autocomplete. This allows users to search for:
- Cities and countries
- Addresses
- Hotels (e.g., "Sheraton Hotel")
- Restaurants
- Shopping malls
- Universities
- And any other places

## Setup Instructions

### 1. Get a Google Cloud Account
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account
- Create a new project or select an existing one

### 2. Enable Places API
1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Places API"
3. Click on **Places API (New)** or **Places API**
4. Click **Enable**

### 3. Create API Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API key**
3. Copy the generated API key
4. (Recommended) Click **Restrict Key** and:
   - Under **Application restrictions**, select **HTTP referrers** or **IP addresses** for web
   - Under **API restrictions**, select **Restrict key** and choose **Places API**

### 4. Set Up Billing (Required)
⚠️ **Important**: Google Places API requires billing to be enabled, but offers a free tier:
- **Free tier**: $200 credit per month
- **Autocomplete pricing**: ~$2.83 per 1,000 requests
- **Most apps stay within free tier** for moderate usage

1. Go to **Billing** in Google Cloud Console
2. Link a credit card (won't be charged unless you exceed free tier)
3. Set up budget alerts to monitor usage

### 5. Add API Key to Your App

#### Option A: Using .env file (Recommended)
1. Create a `.env` file in the root of your project (if not exists)
2. Add your API key:
```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
```

3. Restart your development server:
```bash
npx expo start --clear
```

#### Option B: Using app.config.ts
Add to `app.config.ts`:
```typescript
export default {
  // ... other config
  extra: {
    googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
  },
}
```

### 6. Test the Feature
1. Open the app
2. Go to Create Post > More > Location
3. Type a search query (e.g., "Sheraton", "Lagos", "New York")
4. Results should appear as you type

## Important Notes

### Security Best Practices
- ⚠️ **Never commit** your `.env` file to git
- Add `.env` to `.gitignore`
- Use different API keys for development/production
- Restrict your API key in Google Cloud Console

### Cost Management
- **Monitor usage** in Google Cloud Console > APIs & Services > Dashboard
- Set up **budget alerts** to avoid unexpected charges
- Most apps with moderate usage stay within the **$200 free tier**
- Consider **rate limiting** in production apps

### Alternative: Mock Data
If you don't want to use Google Places API yet, the app will:
- Show an empty state with instructions
- Not make any API calls
- Allow you to continue development without the API key

You can use mock data for testing by keeping the API key empty.

## Pricing Reference (as of 2024)
- **Autocomplete - Per Session**: $2.83 per 1,000 sessions
- **Place Details**: $17 per 1,000 requests
- **Monthly free credit**: $200

For most fashion portfolio apps with moderate usage:
- ~10,000 location searches per month = ~$28
- With $200 free credit = **Free for most use cases**

## Troubleshooting

### "Request Denied" Error
- Check that Places API is enabled in your Google Cloud project
- Verify billing is set up
- Check that your API key is correct

### No Results Appearing
- Check your internet connection
- Verify the API key is set in `.env`
- Restart the Expo dev server after adding the API key
- Check the console for error messages

### Rate Limiting
If you're making too many requests, consider:
- Increasing the debounce delay (currently 500ms)
- Implementing client-side caching
- Using session tokens for autocomplete

## Need Help?
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
