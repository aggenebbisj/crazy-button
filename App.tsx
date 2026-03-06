import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DemoScreen } from './src/screens/DemoScreen';
import { useAuth } from './src/hooks/useAuth';
import { useGroups } from './src/hooks/useGroups';
import { GroupsListScreen } from './src/screens/GroupsListScreen';
import { GroupScreen } from './src/screens/GroupScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';
import { JoinGroupScreen } from './src/screens/JoinGroupScreen';
import { ScoreboardScreen } from './src/screens/ScoreboardScreen';
import { InviteScreen } from './src/screens/InviteScreen';
import { Group } from './src/types';
import { COLORS } from './src/constants/theme';

const IS_DEMO = !process.env.EXPO_PUBLIC_SUPABASE_URL;

type Screen = 'groups' | 'group' | 'create' | 'join' | 'scoreboard' | 'invite';

export default function App() {
  // In demo mode, skip Supabase entirely
  if (IS_DEMO) {
    return (
      <>
        <DemoScreen />
        <StatusBar style="light" />
      </>
    );
  }

  return <FullApp />;
}

function FullApp() {
  const { user, loading: authLoading } = useAuth();
  const { groups, loading: groupsLoading, createGroup, joinGroup, leaveGroup } = useGroups(user?.id);
  const [currentScreen, setCurrentScreen] = useState<Screen>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Crazy Button laden... 🤪</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  switch (currentScreen) {
    case 'groups':
      return (
        <>
          <GroupsListScreen
            groups={groups}
            loading={groupsLoading}
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setCurrentScreen('group');
            }}
            onCreateGroup={() => setCurrentScreen('create')}
            onJoinGroup={() => setCurrentScreen('join')}
            onLeaveGroup={(id) => leaveGroup(id)}
          />
          <StatusBar style="light" />
        </>
      );

    case 'group':
      if (!selectedGroup || !user) return null;
      return (
        <>
          <GroupScreen
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            isAnonymous={selectedGroup.is_anonymous}
            userId={user.id}
            onBack={() => setCurrentScreen('groups')}
            onScoreboard={() => setCurrentScreen('scoreboard')}
            onInvite={() => setCurrentScreen('invite')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'create':
      return (
        <>
          <CreateGroupScreen
            onCreate={async (name, isAnonymous) => {
              const group = await createGroup(name, isAnonymous);
              if (group) {
                setSelectedGroup(group);
                setCurrentScreen('group');
              }
            }}
            onBack={() => setCurrentScreen('groups')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'join':
      return (
        <>
          <JoinGroupScreen
            onJoin={async (code) => {
              const success = await joinGroup(code);
              if (success) setCurrentScreen('groups');
              return success;
            }}
            onBack={() => setCurrentScreen('groups')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'scoreboard':
      if (!selectedGroup) return null;
      return (
        <>
          <ScoreboardScreen
            groupId={selectedGroup.id}
            onBack={() => setCurrentScreen('group')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'invite':
      if (!selectedGroup) return null;
      return (
        <>
          <InviteScreen
            inviteCode={selectedGroup.invite_code}
            groupName={selectedGroup.name}
            onBack={() => setCurrentScreen('group')}
          />
          <StatusBar style="light" />
        </>
      );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 16,
    fontSize: 18,
  },
});
