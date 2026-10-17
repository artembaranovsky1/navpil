import {describe, it, expect} from 'vitest';
import {itemCreateSchema, itemUpdateSchema} from '../validation/item.validation.js';

const validItem = {
    name: 'Вечеря',
    amount: 1740,
    category: 'food',
};

describe('itemCreateSchema', () => {
    it('приймає мінімальну правильну витрату', () => {
        const result = itemCreateSchema.safeParse({
            ...validItem,
        });

        expect(result.success).toBe(true);
    });

    it('зберігає передану дату', () => {
        const result = itemCreateSchema.safeParse({
            ...validItem,
            date: '2026-05-14',
        })

        expect(result.success).toBe(true);
        expect(result.data?.date).toBe('2026-05-14');
    })

    it('відхиляє відʼємну суму', () => {
        expect(() =>
            itemCreateSchema.parse({
                ...validItem,
                amount: -50
            })
        ).toThrow('Сума має бути більшою за 0')
    })

    it('відхиляє нульову суму', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                amount: 0
            })
        ).toThrow('Сума має бути більшою за 0')
    })

    it('відхиляє суму рядком', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                amount: '100'
            })
        ).toThrow('Сума має бути числом')
    })

    it('відхиляє невідому категорію', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                category: 'pizza'
            })
        ).toThrow()
    })

    it('відхиляє неправильний формат дати', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                date: '2026.05.14'
            })
        ).toThrow()
    })

    it('відхиляє порожній splitBetween', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                splitBetween: []
            })
        ).toThrow('Оберіть хоча б одного учасника')
    })

    it('учасники повторюються в splitBetween', () => {
        expect(() => itemCreateSchema.parse({
                ...validItem,
                splitBetween: ['a', 'a']
            })
        ).toThrow('Учасники не мають повторюватися')
    })

    it('обрізає пробіли в описі', () => {
        const result = itemCreateSchema.safeParse({
            ...validItem,
            description: '  text  '
        })

        expect(result.success).toBe(true);
        expect(result.data?.description).toBe('text');
    })


    describe('itemUpdateSchema', () => {
        it('приймає порожній обʼєкт', () => {
            const result = itemUpdateSchema.safeParse({})

            expect(result.success).toBe(true);
        })

        it('не підставляє дату й категорію', () => {
            const result = itemUpdateSchema.safeParse({
                amount: 100
            })

            expect(result.success).toBe(true);
            expect(result.data).not.toHaveProperty('date');
            expect(result.data).not.toHaveProperty('category');
        })
    })


});