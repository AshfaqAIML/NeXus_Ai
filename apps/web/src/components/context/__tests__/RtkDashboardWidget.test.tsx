import { render, screen } from '@testing-library/react';
import { RTKDashboardWidget } from '../RtkDashboardWidget';
import { useChatStore } from '@/store/chatStore';

// Mock Zustand store
jest.mock('@/store/chatStore');

describe('RTKDashboardWidget', () => {
  it('renders correctly when optimizing', () => {
    // Mock state
    (useChatStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector({
        totalOriginalTokens: 10000,
        totalCompressedTokens: 2500,
      })
    );

    render(<RTKDashboardWidget />);
    
    // Check if calculations are correct (75% saved)
    expect(screen.getByText('75% Saved')).toBeInTheDocument();
    expect(screen.getByText('10,000 tok')).toBeInTheDocument();
    expect(screen.getByText('2,500 tok')).toBeInTheDocument();
  });

  it('does not render if no optimization has occurred', () => {
    (useChatStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector({
        totalOriginalTokens: 0,
        totalCompressedTokens: 0,
      })
    );

    const { container } = render(<RTKDashboardWidget />);
    expect(container).toBeEmptyDOMElement();
  });
});