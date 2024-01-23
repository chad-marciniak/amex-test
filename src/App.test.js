import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    // Mock the Axios GET requests
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            name: { title: 'Mr', first: 'John', last: 'Doe' },
            dob: { age: 30 },
            location: { city: 'New York' },
            picture: { thumbnail: 'thumbnail-url' },
          },
        ],
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });
  });

  test('renders data table and handles pagination', async () => {
    render(<App />);

    // Wait for data to load
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Check if the rendered data is correct
    expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();

    // Click next button and check if pagination updates
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Current Page: 2')).toBeInTheDocument());

    // Click prev button and check if pagination updates
    fireEvent.click(screen.getByText('Prev'));
    await waitFor(() => expect(screen.getByText('Current Page: 1')).toBeInTheDocument());
  });

  test('expands and collapses rows with subcomponents', async () => {
    render(<App />);

    // Wait for data to load
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Click the expander button
    fireEvent.click(screen.getByText('>'));
    
    // Wait for subcomponent to be visible
    await waitFor(() => expect(screen.getByText('thumbnail-url')).toBeInTheDocument());

    // Click the expander button again
    fireEvent.click(screen.getByText('V'));

    // Wait for subcomponent to be removed
    await waitFor(() => expect(screen.queryByText('thumbnail-url')).toBeNull());
  });
});