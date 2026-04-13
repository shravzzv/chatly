// apps/native/app/(private)/dashboard/index.tsx
import ConversationPreview from '@/components/conversation-preview'
import { Input } from '@/components/ui/input'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { Profile } from '@chatly/types/profile'
import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, View } from 'react-native'

export default function Page() {
  const data: Profile[] = [
    {
      id: 'f58ffbdd-c005-40ad-b7c0-75de04c708b1',
      user_id: 'be32178a-4f54-48a9-9b3b-233628ac3640',
      name: 'Sai Shravan',
      username: 'shravzzv',
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/be32178a-4f54-48a9-9b3b-233628ac3640/avatar?v=ee9e4ae1-62c3-4d5f-84ad-d61f3dfe10d3',
      bio: 'I am a human.',
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-19 07:35:35.024007+00',
      updated_at: '2026-02-16 14:06:58.013473+00',
    },
    {
      id: '5cedad64-b43b-4ec5-8fd0-e220ce8046e1',
      user_id: '90e4b820-9d3e-45b3-95e9-b07b0f53b799',
      name: 'Sai',
      username: 'sai',
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/90e4b820-9d3e-45b3-95e9-b07b0f53b799/avatar?v=0e08aa7d-d58b-429b-99d6-94f22315afb5',
      bio: 'I love code design.',
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-28 14:36:20.821933+00',
      updated_at: '2026-02-07 10:00:25.862357+00',
    },
    {
      id: '99eb4087-b784-4930-aa2e-82f74f7744b5',
      user_id: 'a65868d3-da06-4067-a68c-c5dce13a054c',
      name: 'Armand Morin',
      username: null,
      avatar_url:
        'https://lh3.googleusercontent.com/a/ACg8ocJr7IMDbSzNLc7t4al7C7fXZ81kfN30Jqc56eDcljVFiMs7b_wS=s96-c',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-02-07 04:18:27.619145+00',
      updated_at: '2026-02-07 04:18:27.619145+00',
    },
    {
      id: 'd7049d60-b151-4dbe-86c8-0617c91a672d',
      user_id: '6fb872cd-e103-47af-9c01-a659223c1aa2',
      name: 'Saki Celik',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/6fb872cd-e103-47af-9c01-a659223c1aa2/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-26 09:21:26.126108+00',
      updated_at: '2026-01-26 09:21:28.496742+00',
    },
    {
      id: 'dd6e7962-9af4-46bc-a475-59016a8e18ec',
      user_id: 'ef2780c6-92b0-47d6-afaf-fee938e8dc61',
      name: 'Whatsapp Bildiri',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/ef2780c6-92b0-47d6-afaf-fee938e8dc61/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-26 09:16:47.714303+00',
      updated_at: '2026-01-26 09:16:50.018846+00',
    },
    {
      id: 'e4f3739e-a5bd-4fa3-a449-bed58e1e69b6',
      user_id: '66bb3205-42c5-45cb-8f7d-e3a59b0e9027',
      name: 'Dev games',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/66bb3205-42c5-45cb-8f7d-e3a59b0e9027/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:43.199422+00',
    },
    {
      id: '2d5c6335-7454-45a3-9fdf-f07d0b536141',
      user_id: 'b477fc66-2580-49c5-a014-cc6e1a05ffcf',
      name: 'Heri Thea',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/b477fc66-2580-49c5-a014-cc6e1a05ffcf/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:39.032698+00',
    },
    {
      id: '1c321cd4-12cf-4808-8f99-e2c5b489af5a',
      user_id: '77d560c1-b280-4c58-98ee-cb5ecaa14aa9',
      name: 'POWERENJER KUNING Renjer',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/77d560c1-b280-4c58-98ee-cb5ecaa14aa9/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:38.836266+00',
    },
    {
      id: '7c730039-74ab-4316-b1d5-d7f6984f9723',
      user_id: 'a70098d5-83bc-4f31-992f-36ce5997011a',
      name: 'Muhammad pradit',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/a70098d5-83bc-4f31-992f-36ce5997011a/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:38.809518+00',
    },
    {
      id: '205bf2cd-5e47-49d4-b37b-3cd9e0857212',
      user_id: '5c1ccf62-79e9-47e5-bf12-7cae6d8abf60',
      name: 'Krishna. Vadla.',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/5c1ccf62-79e9-47e5-bf12-7cae6d8abf60/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:38.674397+00',
    },
    {
      id: '2e1b9de7-5a93-4634-919e-cec10090eaad',
      user_id: '337be9e0-b8aa-42d9-a6d9-06c9b63e891f',
      name: 'Fandi Putra',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/337be9e0-b8aa-42d9-a6d9-06c9b63e891f/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:38.524755+00',
    },
    {
      id: '86f577be-68a1-4e36-94c5-7e00a219dd8c',
      user_id: '254a93b6-5205-4951-ac3a-79bbe2542505',
      name: 'vadla thilakchary',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/254a93b6-5205-4951-ac3a-79bbe2542505/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:37.603709+00',
    },
    {
      id: '1eb627ad-4bf7-48b4-9a43-a9d0c3da40ef',
      user_id: '3ae777be-766d-4b16-bfaa-2848c169a64e',
      name: 'Today you know',
      username: null,
      avatar_url:
        'https://cnmrbnphntasntzxeeqm.supabase.co/storage/v1/object/public/avatars/3ae777be-766d-4b16-bfaa-2848c169a64e/avatar',
      bio: null,
      status: 'offline',
      last_seen_at: null,
      theme: 'system',
      created_at: '2026-01-06 08:20:33.333614+00',
      updated_at: '2026-01-06 08:20:37.454022+00',
    },
  ]

  const [profiles, setProfiles] = useState<Profile[]>(data)

  const handleSearch = (input: string) => {
    const query = input.trim().toLowerCase()

    if (!query) {
      setProfiles(data)
      return
    }

    setProfiles(() =>
      data.filter((p) => {
        const name = p.name?.toLowerCase() || ''
        const username = p.username?.toLowerCase() || ''
        return name.includes(query) || username.includes(query)
      }),
    )
  }

  return (
    <Screen className='gap-2'>
      <Input
        className='mx-auto max-w-xl'
        placeholder='name or username...'
        returnKeyType='search'
        onChangeText={handleSearch}
      />

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        className='mx-auto w-full max-w-sm flex-1'
        contentContainerClassName={cn(
          profiles.length === 0 && 'flex-1',
          'w-full mx-auto max-w-sm gap-2 rounded-xl',
        )}
        ListEmptyComponent={() => (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-sm text-muted-foreground'>
              No profiles found
            </Text>
          </View>
        )}
        renderItem={({ item: profile }) => (
          <ConversationPreview
            profile={profile}
            onPress={() => router.push(`/chat/${profile.id}`)}
          />
        )}
      />
    </Screen>
  )
}
