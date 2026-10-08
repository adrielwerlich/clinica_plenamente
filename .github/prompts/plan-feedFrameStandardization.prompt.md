Yes, I’d standardize the **media frame** so every post has a consistent width and height. Images with different source dimensions should scale proportionally inside that frame; they should never be stretched.

The tall, narrow display is mathematically consistent with the current implementation: each image’s crop rectangle determines its frame ratio. But it can make carousel slides change size and look uneven.

I recommend a **responsive 4:5 frame** for the feed, with a neutral background. Admins could either:

- **Fit** the whole image inside it, which preserves infographics but may leave space around them.
- **Crop** to fill it, using a ratio-locked crop area that admins can move and resize.

That keeps the feed consistent while avoiding accidental loss of text-heavy image content. The current free-form crop lets each image produce a different frame ratio, so it would need to change to support this layout.