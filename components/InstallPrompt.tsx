"use client";

import { useState, useEffect } from "react";
import { Share, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window.navigator as any).standalone === true
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    // Don't show if already installed
    if (isStandalone) return null;

    // Debug helper for non-secure contexts
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.0.0.')) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
                <p className="font-bold">Setup Required</p>
                <p className="text-sm">To install this app, you must use <b>USB Debugging</b>.</p>
                <p className="text-xs mt-1">1. Connect phone to PC via USB.</p>
                <p className="text-xs">2. Open <code>chrome://inspect</code> on PC.</p>
                <p className="text-xs">3. Enable Port Forwarding (3000 -&gt; localhost:3000).</p>
                <p className="text-xs">4. Open <code>localhost:3000</code> on phone.</p>
            </div>
        );
    }

    return (
        <AnimatePresence>
            {(showPrompt || (isIOS && !isStandalone)) && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
                >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Install Islamic Mood
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Add to home screen for the best experience
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <p className="mb-2 flex items-center gap-2">
                                    1. Tap the <Share size={16} className="text-blue-500" /> share
                                    button
                                </p>
                                <p>2. Scroll down and tap &quot;Add to Home Screen&quot;</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Install App
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
