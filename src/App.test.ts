// src/components/HelloWorld.test.js (or wherever your component is)
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils'; // You'll need to install @vue/test-utils
import App from './App.vue'; // Adjust path if your App.vue is not in src/

// A very basic example test for your App component
describe('App', () => {
  it('renders the initial bot message', () => {
    const wrapper = mount(App);
    // Check if the initial bot message is rendered
    expect(wrapper.text()).toContain('Hello! How can I help you today?');
  });

  it('updates input model on type', async () => {
    const wrapper = mount(App);
    const input = wrapper.find('input');
    await input.setValue('Test message');
    expect(input.element.value).toBe('Test message');
  });

  // You would add more comprehensive tests here for sendMessage, API calls (mocked), etc.
});
