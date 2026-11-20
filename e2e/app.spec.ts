import { expect, test } from '@playwright/test'

test('navigates from dashboard to logs and filters by severity', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Good morning, Jordan' })).toBeVisible()
  await page.getByRole('link', { name: 'Log explorer' }).click()
  await expect(page.getByRole('heading', { name: 'Log explorer' })).toBeVisible()
  await page.getByRole('button', { name: 'Critical', exact: true }).click()
  await expect(page.getByText('Unhandled exception in payment processing')).toBeVisible()
  await expect(page.getByText('Retry limit approaching for job #wk_2048')).toHaveCount(0)
})

test('analyzes a pasted error and shows the suggested fix', async ({ page }) => {
  await page.goto('/analysis')
  await page.getByLabel('Error log').fill("TypeError: Cannot read properties of undefined (reading 'customerId')")
  await page.getByRole('button', { name: 'Analyze error' }).click()
  await expect(page.getByText('Analysis complete')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Potential root causes')).toBeVisible()
  await expect(page.getByText('Suggested fix')).toBeVisible()
})

test('searches and opens conversation history', async ({ page }) => {
  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'Conversation history' })).toBeVisible()
  await expect(page.getByText('Payment processor TypeError')).toBeVisible()
  await page.locator('.conversation-open').filter({ hasText: 'Payment processor TypeError' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('DebugMate AI', { exact: true })).toBeVisible()
})
