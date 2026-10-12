import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { KnowledgeEngineeringTryItYourselfWidget } from './AILearnSection';

describe('KnowledgeEngineeringTryItYourselfWidget', () => {
  it('guides the student through the three clues and reveals the final deduction', async () => {
    const user = userEvent.setup();
    render(<KnowledgeEngineeringTryItYourselfWidget />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText(/What does this add to the KB/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Not\(Sam\)/ }));
    expect(screen.getByText(/Correct/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Step 2')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Not\(Kitchen\)/ }));
    expect(screen.getByText(/Correct/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Step 3')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Not\(Fork\)/ }));
    expect(screen.getByText(/Final Deduction/)).toBeInTheDocument();
    expect(screen.getByText(/Riya ate the cake, in the Garden, with her Hands/)).toBeInTheDocument();
  });
});
