import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { WebsimSocket, useQuery } from "@websim/use-query";
const room = new WebsimSocket();
function App() {
  const [showGenerator, setShowGenerator] = useState(false);
  const { data: storedImages, loading: imagesLoading } = useQuery(
    room.query("SELECT * FROM public.logo_images ORDER BY created_at DESC")
  );
  const [localImages, setLocalImages] = useState([]);
  const images = storedImages || [];
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const { data: prompts } = useQuery(room.collection("prompts"));
  const lastImageElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreImages();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  const loadMoreImages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      if (prompts && prompts.length > 0) {
        const randomPrompts = getRandomPrompts(prompts, 2);
        const mergedPrompt = mergePrompts(randomPrompts);
        const newImage = await generateLogo(mergedPrompt);
        if (newImage) {
          await room.collection("logo_images").create({
            url: newImage,
            prompt: mergedPrompt,
            type: "generated"
          });
        }
      }
      setHasMore(prompts && prompts.length > 0);
    } catch (error) {
      console.error("Error loading more images:", error);
    } finally {
      setLoading(false);
    }
  };
  const getRandomPrompts = (promptList, count) => {
    const shuffled = [...promptList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  const mergePrompts = (promptArray) => {
    if (promptArray.length === 0) return "modern minimalist logo";
    if (promptArray.length === 1) return promptArray[0].text;
    const texts = promptArray.map((p) => p.text);
    return `A logo that combines ${texts.join(" and ")}`;
  };
  const generateLogo = async (prompt) => {
    try {
      const result = await websim.imageGen({
        prompt: `${prompt}, professional logo design, vector style, clean modern, high quality`,
        width: 512,
        height: 512
      });
      return result.url;
    } catch (error) {
      console.error("Error generating logo:", error);
      return null;
    }
  };
  const handleNewImage = (newImage) => {
    setLocalImages((prev) => [newImage, ...prev]);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-900 text-white", children: [
    /* @__PURE__ */ jsxDEV(Header, { onGenerate: () => setShowGenerator(!showGenerator) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 99,
      columnNumber: 13
    }, this),
    showGenerator && /* @__PURE__ */ jsxDEV(
      ImageGenerator,
      {
        onGenerate: handleNewImage,
        prompts: prompts || []
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 101,
        columnNumber: 17
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      Gallery,
      {
        images,
        loading: loading || imagesLoading,
        lastImageRef: lastImageElementRef,
        hasMore
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 106,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 98,
    columnNumber: 9
  }, this);
}
function Header({ onGenerate }) {
  return /* @__PURE__ */ jsxDEV("header", { className: "bg-gray-800 shadow-lg", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent", children: "Infinite Logo Gallery" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 122,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-gray-400 mt-1", children: "AI-powered logo generation with infinite scroll" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 125,
        columnNumber: 25
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 121,
      columnNumber: 21
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        onClick: onGenerate,
        className: "px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200",
        children: "Generate New Logo"
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 127,
        columnNumber: 21
      },
      this
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 120,
    columnNumber: 17
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 119,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 118,
    columnNumber: 9
  }, this);
}
function ImageGenerator({ onGenerate, prompts }) {
  const [textPrompt, setTextPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [imagePreview, setImagePreview] = useState(null);
  const styles = [
    "modern",
    "minimalist",
    "vintage",
    "tech",
    "luxury",
    "playful",
    "corporate",
    "artistic",
    "geometric",
    "organic"
  ];
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e2) => setImagePreview(e2.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleGenerateFromText = async () => {
    if (!textPrompt.trim()) return;
    setGenerating(true);
    try {
      const result = await websim.imageGen({
        prompt: `${textPrompt}, ${selectedStyle} logo design, professional, high quality, vector style`,
        width: 512,
        height: 512
      });
      const newImage = await room.collection("logo_images").create({
        url: result.url,
        prompt: textPrompt,
        type: "text",
        style: selectedStyle
      });
      await room.collection("prompts").create({
        text: textPrompt,
        style: selectedStyle
      });
      onGenerate(newImage);
      setTextPrompt("");
    } catch (error) {
      console.error("Error generating from text:", error);
      alert("Failed to generate logo. Please try a different prompt or refresh the page.");
    } finally {
      setGenerating(false);
    }
  };
  const handleGenerateFromImage = async () => {
    if (!imageFile || !textPrompt.trim()) return;
    setGenerating(true);
    try {
      const enhancedPrompt = `Professional logo design: ${textPrompt}. Clean, modern, vector-style logo suitable for business branding. High quality, minimalist aesthetic.`;
      const result = await websim.imageGen({
        prompt: enhancedPrompt,
        width: 512,
        height: 512
      });
      const newImage = await room.collection("logo_images").create({
        url: result.url,
        prompt: textPrompt,
        type: "image+text",
        originalPrompt: textPrompt
      });
      onGenerate(newImage);
      setImageFile(null);
      setImagePreview(null);
      setTextPrompt("");
    } catch (error) {
      console.error("Error generating from image:", error);
      try {
        const fallbackPrompt = `Professional logo: ${textPrompt}, clean modern design`;
        const result = await websim.imageGen({
          prompt: fallbackPrompt,
          width: 512,
          height: 512
        });
        const newImage = await room.collection("logo_images").create({
          url: result.url,
          prompt: textPrompt,
          type: "text",
          style: "modern"
        });
        onGenerate(newImage);
        setImageFile(null);
        setImagePreview(null);
        setTextPrompt("");
      } catch (fallbackError) {
        console.error("Fallback generation failed:", fallbackError);
        alert("Failed to generate logo. Please try a simpler prompt or refresh the page.");
      }
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "bg-gray-800 mx-4 mt-6 p-6 rounded-lg shadow-xl", children: /* @__PURE__ */ jsxDEV("div", { className: "grid md:grid-cols-2 gap-6", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-3", children: "Generate from Text" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 260,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "textarea",
        {
          value: textPrompt,
          onChange: (e) => setTextPrompt(e.target.value),
          placeholder: "Describe your logo idea...",
          className: "w-full px-4 py-2 bg-gray-700 rounded-lg mb-3 resize-none",
          rows: 3
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 261,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          value: selectedStyle,
          onChange: (e) => setSelectedStyle(e.target.value),
          className: "w-full px-4 py-2 bg-gray-700 rounded-lg mb-3",
          children: styles.map((style) => /* @__PURE__ */ jsxDEV("option", { value: style, children: style.charAt(0).toUpperCase() + style.slice(1) }, style, false, {
            fileName: "<stdin>",
            lineNumber: 274,
            columnNumber: 29
          }, this))
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 268,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: handleGenerateFromText,
          disabled: !textPrompt.trim() || generating,
          className: "w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
          children: generating ? "Generating..." : "Generate from Text"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 279,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 259,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-3", children: "Generate from Image + Text" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 289,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "file",
          accept: "image/*",
          onChange: handleImageFileChange,
          className: "w-full px-4 py-2 bg-gray-700 rounded-lg mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 290,
          columnNumber: 21
        },
        this
      ),
      imagePreview && /* @__PURE__ */ jsxDEV("img", { src: imagePreview, alt: "Preview", className: "w-full h-24 object-cover rounded-lg mb-3" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 297,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV(
        "textarea",
        {
          value: textPrompt,
          onChange: (e) => setTextPrompt(e.target.value),
          placeholder: "Describe what you want from the image...",
          className: "w-full px-4 py-2 bg-gray-700 rounded-lg mb-3 resize-none",
          rows: 3
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 299,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: handleGenerateFromImage,
          disabled: !imageFile || !textPrompt.trim() || generating,
          className: "w-full px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed",
          children: generating ? "Generating..." : "Generate from Image"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 306,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 288,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 258,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 257,
    columnNumber: 9
  }, this);
}
function Gallery({ images, loading, lastImageRef, hasMore }) {
  if (loading && (!images || images.length === 0)) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center items-center h-64", children: /* @__PURE__ */ jsxDEV("div", { className: "text-2xl", children: "Loading..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 323,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 322,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: images?.map((image, index) => /* @__PURE__ */ jsxDEV(
      ImageCard,
      {
        image,
        isLast: index === images.length - 1,
        lastImageRef
      },
      `${image.id}-${index}`,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 333,
        columnNumber: 21
      },
      this
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 331,
      columnNumber: 13
    }, this),
    loading && /* @__PURE__ */ jsxDEV("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxDEV("div", { className: "text-xl", children: "Loading more..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 343,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 342,
      columnNumber: 17
    }, this),
    !hasMore && images.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "text-center py-8 text-gray-400", children: /* @__PURE__ */ jsxDEV("div", { className: "text-xl", children: "End of gallery" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 348,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 347,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 330,
    columnNumber: 9
  }, this);
}
function ImageCard({ image, isLast, lastImageRef }) {
  const [copied, setCopied] = useState(false);
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(image.prompt || "No prompt available");
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const cardRef = isLast ? lastImageRef : null;
  return /* @__PURE__ */ jsxDEV("div", { ref: cardRef, className: "bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow fade-in", children: [
    /* @__PURE__ */ jsxDEV(
      "img",
      {
        src: image.url,
        alt: image.prompt || "Generated logo",
        className: "w-full h-48 object-cover card-image",
        onError: (e) => {
          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbyBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg==";
        }
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 368,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-gray-300 truncate mb-2", title: image.prompt, children: image.prompt || "Logo" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 377,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded", children: image.type }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 381,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: copyPrompt,
            className: "text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors",
            children: copied ? "Copied!" : "Copy"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 384,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 380,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-gray-400 mt-2", children: new Date(image.created_at).toLocaleDateString() }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 391,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 376,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 367,
    columnNumber: 9
  }, this);
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-900 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl mb-4", children: "Something went wrong" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 419,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700",
            children: "Reload Page"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 420,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 418,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 417,
        columnNumber: 17
      }, this);
    }
    return this.props.children;
  }
}
const root = createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ jsxDEV(ErrorBoundary, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 438,
    columnNumber: 9
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 437,
    columnNumber: 5
  })
);
