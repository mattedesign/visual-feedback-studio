import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// V128 Theme Extensions
				v128: {
					slate: {
						50: 'hsl(var(--v128-slate-50))',
						100: 'hsl(var(--v128-slate-100))',
						200: 'hsl(var(--v128-slate-200))',
						300: 'hsl(var(--v128-slate-300))',
						500: 'hsl(var(--v128-slate-500))',
						600: 'hsl(var(--v128-slate-600))',
						700: 'hsl(var(--v128-slate-700))',
						800: 'hsl(var(--v128-slate-800))',
						900: 'hsl(var(--v128-slate-900))'
					},
					purple: {
						500: 'hsl(var(--v128-purple-500))',
						600: 'hsl(var(--v128-purple-600))',
						700: 'hsl(var(--v128-purple-700))'
					},
					green: {
						400: 'hsl(var(--v128-green-400))',
						500: 'hsl(var(--v128-green-500))',
						600: 'hsl(var(--v128-green-600))'
					},
					blue: {
						500: 'hsl(var(--v128-blue-500))'
					},
					amber: {
						400: 'hsl(var(--v128-amber-400))'
					},
					red: {
						500: 'hsl(var(--v128-red-500))'
					}
				},
				goblin: {
					primary: 'hsl(var(--goblin-primary))',
					secondary: 'hsl(var(--goblin-secondary))',
					accent: 'hsl(var(--goblin-accent))',
					bg: 'hsl(var(--goblin-bg))',
					text: 'hsl(var(--goblin-text))'
				}
			},
			fontFamily: {
				display: 'var(--font-display)',
				body: 'var(--font-body)',
				mono: 'var(--font-mono)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'v128-soft': 'var(--shadow-soft)',
				'v128-medium': 'var(--shadow-medium)',
				'v128-large': 'var(--shadow-large)',
				'v128-goblin': 'var(--shadow-goblin)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-goblin': 'var(--gradient-goblin)',
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			transitionDuration: {
				'v128-quick': 'var(--transition-quick)',
				'v128-smooth': 'var(--transition-smooth)',
				'v128-slow': 'var(--transition-slow)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
