// apps/native/app/(private)/_layout.tsx
import { Tabs } from 'expo-router'
import { CreditCard, LayoutDashboard, User } from 'lucide-react-native'

export default function PrivateLayout() {
  return (
    <Tabs
      initialRouteName='dashboard'
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name='dashboard'
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={28} color={color} />
          ),
          headerShown: false,
          href: '/dashboard',
        }}
      />

      <Tabs.Screen
        name='account'
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <User size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name='plan'
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <CreditCard size={28} color={color} />,
        }}
      />
    </Tabs>
  )
}
