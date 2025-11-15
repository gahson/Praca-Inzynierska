import { it, expect, describe} from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import React from 'react';
import TextTooltip from '../../src/components/TextTooltip';

describe('ToolTip', () => {
    it('should render a text with tooltip', () =>{
        render(<TextTooltip text='this is the text' tooltip='this is the tooltip'/>);

        const txt = screen.getByText(/this is the text/i)

        const tltp = screen.getByText(/this is the tooltip/i)

        expect(txt).toBeInTheDocument();
        expect(tltp).toBeInTheDocument();
        //screen.debug();
    })
})