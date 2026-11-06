import {StyleSheet, Text, View} from 'react-native';
import {colors, fonts} from '@/color';
import {getAvatarColor} from '@/utils/colors';

type AvatarProps = {
    id: string;
    name: string;
    size?: number;
    // за замовчуванням — стабільний колір людини
    background?: string;
    color?: string;
    borderColor?: string;
}

export function Avatar({id, name, size = 36, background, color = '#FFFFFF', borderColor}: AvatarProps) {
    return (
        <View
            style={[
                styles.avatar,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: background ?? getAvatarColor(id),
                },
                borderColor && {borderWidth: 2, borderColor},
            ]}
        >
            <Text style={[styles.text, {color, fontSize: Math.round(size * 0.38)}]}>
                {name.trim().charAt(0).toUpperCase()}
            </Text>
        </View>
    );
}

type AvatarStackProps = {
    members: { id: string; name: string }[];
    max: number;
    size?: number;
    // колір фону під стеком: ним малюємо рамку між аватарками
    ringColor?: string;
    // мобільна шапка: поточний юзер чорним, решта сірі
    currentUserId?: string;
    monochrome?: boolean;
    moreBackground?: string;
    moreColor?: string;
}

export function AvatarStack({
                                members,
                                max,
                                size = 30,
                                ringColor = colors.background,
                                currentUserId,
                                monochrome = false,
                                moreBackground = colors.ghostHover,
                                moreColor = colors.text,
                            }: AvatarStackProps) {
    const sorted = currentUserId
        ? [...members].sort((a, b) => Number(b.id === currentUserId) - Number(a.id === currentUserId))
        : members;
    const visible = sorted.slice(0, max);
    const hiddenCount = sorted.length - visible.length;

    return (
        <View style={styles.stack}>
            {visible.map((member, index) => {
                const isMe = member.id === currentUserId;

                return (
                    <View key={member.id} style={index > 0 && {marginLeft: -size * 0.28}}>
                        <Avatar
                            id={member.id}
                            name={member.name}
                            size={size}
                            borderColor={ringColor}
                            background={monochrome ? (isMe ? colors.text : colors.ghostHover) : undefined}
                            color={monochrome && !isMe ? colors.text : '#FFFFFF'}
                        />
                    </View>
                );
            })}
            {hiddenCount > 0 && (
                <View
                    style={[
                        styles.avatar,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            marginLeft: -size * 0.28,
                            borderWidth: 2,
                            borderColor: ringColor,
                            backgroundColor: moreBackground,
                        },
                    ]}
                >
                    <Text style={[styles.text, {color: moreColor, fontSize: Math.round(size * 0.38)}]}>+{hiddenCount}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {alignItems: 'center', justifyContent: 'center'},
    text: {fontFamily: fonts.medium},
    stack: {flexDirection: 'row'},
});
