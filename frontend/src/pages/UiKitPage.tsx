import { Button } from '../components/Button/Button';

const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;

export const UiKitPage = () => {
    return (
        <main style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h1 style={{ margin: 0, fontWeight: 400, fontSize: 40 }}>UI Kit</h1>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Buttons</h2>

                {variants.map((variant) => (
                    <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 100, fontSize: 14 }}>{variant}</span>
                        <Button variant={variant}>Зберегти</Button>
                        <Button variant={variant} loading>
                            Зберегти
                        </Button>
                        <Button variant={variant} disabled>
                            Зберегти
                        </Button>
                    </div>
                ))}
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Sizes</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button size="lg">Large · 56</Button>
                    <Button size="md">Medium · 48</Button>
                    <Button size="sm">Small · 44</Button>
                </div>
            </section>
        </main>
    );
};