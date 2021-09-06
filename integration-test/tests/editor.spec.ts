/* Copyright 2021, Milkdown by Mirone. */

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/#/preset-commonmark');
});

test('has editor', async ({ page }) => {
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test.describe('input', () => {
    test.describe('node', () => {
        test('input paragraph', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
        });

        test('input heading', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('# Heading1');
            expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('## Heading2');
            expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
        });

        test('input blockquote ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('> Blockquote');
            const blockquote = await page.waitForSelector('.blockquote');

            expect(await blockquote.$$('p')).toHaveLength(1);
            expect(await blockquote.waitForSelector('p >> text=Blockquote')).toBeTruthy();

            await editor.type('\n');

            await editor.type('Next line.');

            expect(await blockquote.$$('p')).toHaveLength(2);
            expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
        });

        test('input bullet list ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('* list item 1');
            const list = await page.waitForSelector('.bullet-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('input ordered list ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('1. list item 1');
            const list = await page.waitForSelector('.ordered-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('input hr', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('---');
            expect(await editor.waitForSelector('.hr')).toBeDefined();
        });

        test('input image', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('![image](url)');
            const image = await editor.waitForSelector('.image');
            expect(image).toBeDefined();
        });

        test('input code block', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('```markdown ');
            const fence = await editor.waitForSelector('.code-fence');
            expect(fence).toBeDefined();
            expect(await fence.getAttribute('data-language')).toBe('markdown');
        });
    });

    test.describe('mark', () => {
        test('input bold', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is **bold test**!');
            expect(await editor.waitForSelector('.strong >> text=bold test')).toBeTruthy();
        });

        test('input em', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is *em test*!');
            expect(await editor.waitForSelector('.em >> text=em test')).toBeTruthy();
        });

        test('input inline code', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is `code test`!');
            expect(await editor.waitForSelector('.code-inline >> text=code test')).toBeTruthy();
        });

        test('input link', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is [link test](url)!');
            expect(await editor.waitForSelector('.link >> text=link test')).toBeTruthy();

            const link = await editor.waitForSelector('.link');
            expect(await link.getAttribute('href')).toBe('url');
        });
    });
});

test.describe('shortcuts', () => {
    test('press hard break', async ({ page }) => {
        const editor = await page.waitForSelector('.editor');
        await editor.type('something');
        await editor.press('Shift+Enter');
        await editor.type('new line');
        await editor.press('Shift+Enter');
        expect(await editor.$$('.hardbreak')).toHaveLength(2);
    });

    test('enter', async ({ page }) => {
        const editor = await page.waitForSelector('.editor');
        await editor.type('The lunatic is on the grass');
        await editor.press('Enter');
        await editor.type('The lunatic is in the hall');
        expect(
            await editor.waitForSelector(':nth-match(.paragraph, 2) >> text=The lunatic is in the hall'),
        ).toBeTruthy();
        await expect(page.locator('.editor > .paragraph')).toHaveCount(2);
    });

    test('delete', async ({ page }) => {
        const editor = await page.waitForSelector('.editor');
        await editor.type('The lunatic is on the grass');
        await editor.press('Delete');
        expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the gras')).toBeTruthy();
        await editor.press('Backspace');
        expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the gra')).toBeTruthy();
    });

    test('select all', async ({ page }) => {
        const editor = await page.waitForSelector('.editor');
        await editor.type('The lunatic is on the grass');
        await editor.press('Control+A');
        await editor.type('Lunatic');
        expect(await editor.waitForSelector('.paragraph >> text=Lunatic')).toBeTruthy();
    });

    test('copy and paste', async ({ page }) => {
        const editor = await page.waitForSelector('.editor');
        await editor.type('The lunatic is on the grass');
        await expect(page.locator('.editor > .paragraph')).toHaveCount(1);
        await editor.press('Control+A');
        await editor.press('Control+C');
        await editor.press('ArrowRight');
        await editor.type('. ');
        await editor.press('Control+V');
        await editor.type('!');
        await expect(page.locator('.editor > .paragraph')).toHaveCount(1);
        expect(
            await editor.waitForSelector(
                '.paragraph >> text=The lunatic is on the grass. The lunatic is on the grass!',
            ),
        ).toBeTruthy();

        await editor.press('Control+A');
        await editor.press('Control+X');
        await editor.type('Lyrics:');
        await editor.press('Enter');
        await editor.press('Control+V');
        await expect(page.locator('.editor > .paragraph')).toHaveCount(2);
        expect(
            await editor.waitForSelector(
                ':nth-match(.paragraph, 2) >> text=The lunatic is on the grass. The lunatic is on the grass!',
            ),
        ).toBeTruthy();
    });
});
