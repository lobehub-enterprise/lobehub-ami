'use client';

import { type MenuProps } from '@lobehub/ui';
import { ActionIcon, DropdownMenu, Flexbox, Icon } from '@lobehub/ui';
import { CircleHelp, FlaskConical, Settings2, SettingsIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useHasActiveWorkspace } from '@/business/client/hooks/useHasActiveWorkspace';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import { useNavLayout } from '@/hooks/useNavLayout';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/slices/settings/selectors/general';

type FooterMenuItems = NonNullable<MenuProps['items']>;

const Footer = memo(() => {
  const { t } = useTranslation('common');
  const { footer } = useNavLayout();
  const hasActiveWorkspace = useHasActiveWorkspace();
  const settingLabelKey = hasActiveWorkspace ? 'userPanel.workspaceSetting' : 'userPanel.setting';
  const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);

  const helpMenuItems: MenuProps['items'] = useMemo(
    () => [
      ...(footer.showSettingsEntry && !isDevMode
        ? [
            {
              icon: <Icon icon={Settings2} />,
              key: 'setting',
              label: <WorkspaceLink to="/settings">{t(settingLabelKey)}</WorkspaceLink>,
            },
            {
              type: 'divider' as const,
            },
          ]
        : []),
      ...(footer.showEvalEntry && footer.layout === 'compact'
        ? [
            {
              icon: <Icon icon={FlaskConical} />,
              key: 'eval',
              label: <WorkspaceLink to="/eval">Evaluation Lab</WorkspaceLink>,
            },
          ]
        : []),
    ],
    [footer.showSettingsEntry, footer.layout, footer.showEvalEntry, isDevMode, t, settingLabelKey],
  );
  const hasHelpMenuItems = !!helpMenuItems?.length;

  return (
    <>
      {footer.layout === 'expanded' ? (
        <Flexbox horizontal align={'center'} gap={2} justify={'space-between'} padding={8}>
          <Flexbox horizontal align={'center'} flex={1} gap={2}>
            {hasHelpMenuItems && (
              <DropdownMenu items={helpMenuItems} placement="topLeft">
                <ActionIcon aria-label={t('userPanel.help')} icon={CircleHelp} size={16} />
              </DropdownMenu>
            )}
            <WorkspaceLink to="/eval">
              <ActionIcon icon={FlaskConical} size={16} title="Evaluation Lab" />
            </WorkspaceLink>
          </Flexbox>
          <ThemeButton placement={'topCenter'} size={16} />
        </Flexbox>
      ) : (
        <Flexbox horizontal align={'center'} gap={2} padding={8}>
          {hasHelpMenuItems && (
            <DropdownMenu items={helpMenuItems} placement="topLeft">
              <ActionIcon aria-label={t('userPanel.help')} icon={CircleHelp} size={16} />
            </DropdownMenu>
          )}
          {isDevMode && (
            <WorkspaceLink to="/settings">
              <ActionIcon
                aria-label={t(settingLabelKey)}
                icon={SettingsIcon}
                size={16}
                title={t(settingLabelKey)}
              />
            </WorkspaceLink>
          )}
        </Flexbox>
      )}
    </>
  );
});

export default Footer;
