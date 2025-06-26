
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float-slow': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1)'
					},
					'25%': {
						transform: 'translateX(20px) translateY(-15px) scale(1.05)'
					},
					'50%': {
						transform: 'translateX(-10px) translateY(-25px) scale(0.95)'
					},
					'75%': {
						transform: 'translateX(-25px) translateY(10px) scale(1.02)'
					}
				},
				'float-normal': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1)'
					},
					'25%': {
						transform: 'translateX(25px) translateY(-20px) scale(1.08)'
					},
					'50%': {
						transform: 'translateX(-15px) translateY(-30px) scale(0.92)'
					},
					'75%': {
						transform: 'translateX(-30px) translateY(15px) scale(1.05)'
					}
				},
				'float-fast': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1)'
					},
					'25%': {
						transform: 'translateX(30px) translateY(-25px) scale(1.1)'
					},
					'50%': {
						transform: 'translateX(-20px) translateY(-35px) scale(0.9)'
					},
					'75%': {
						transform: 'translateX(-35px) translateY(20px) scale(1.08)'
					}
				},
				'float-1': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'33%': {
						transform: 'translateX(30px) translateY(-20px) scale(1.1) rotate(2deg)'
					},
					'66%': {
						transform: 'translateX(-25px) translateY(15px) scale(0.9) rotate(-1deg)'
					}
				},
				'float-2': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'40%': {
						transform: 'translateX(-20px) translateY(-30px) scale(1.05) rotate(-2deg)'
					},
					'80%': {
						transform: 'translateX(35px) translateY(10px) scale(0.95) rotate(1deg)'
					}
				},
				'float-3': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'50%': {
						transform: 'translateX(15px) translateY(-35px) scale(1.08) rotate(3deg)'
					}
				},
				'float-4': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'30%': {
						transform: 'translateX(-35px) translateY(-10px) scale(0.92) rotate(-3deg)'
					},
					'70%': {
						transform: 'translateX(20px) translateY(25px) scale(1.12) rotate(2deg)'
					}
				},
				'float-5': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'45%': {
						transform: 'translateX(25px) translateY(-15px) scale(1.03) rotate(1deg)'
					},
					'90%': {
						transform: 'translateX(-30px) translateY(30px) scale(0.97) rotate(-2deg)'
					}
				},
				'float-6': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'35%': {
						transform: 'translateX(-15px) translateY(-25px) scale(1.06) rotate(-1deg)'
					},
					'75%': {
						transform: 'translateX(40px) translateY(5px) scale(0.94) rotate(2deg)'
					}
				},
				'float-business': {
					'0%, 100%': {
						transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'
					},
					'25%': {
						transform: 'translateX(30px) translateY(-20px) scale(1.05) rotate(1deg)'
					},
					'50%': {
						transform: 'translateX(-15px) translateY(-30px) scale(0.95) rotate(-1deg)'
					},
					'75%': {
						transform: 'translateX(-25px) translateY(15px) scale(1.02) rotate(2deg)'
					}
				},
				'pulse-business': {
					'0%, 100%': {
						opacity: '0.7',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.1)'
					}
				},
				'slide-up-fade': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float-slow': 'float-slow 20s ease-in-out infinite',
				'float-normal': 'float-normal 15s ease-in-out infinite',
				'float-fast': 'float-fast 10s ease-in-out infinite',
				'float-1': 'float-1 18s ease-in-out infinite',
				'float-2': 'float-2 22s ease-in-out infinite',
				'float-3': 'float-3 16s ease-in-out infinite',
				'float-4': 'float-4 24s ease-in-out infinite',
				'float-5': 'float-5 19s ease-in-out infinite',
				'float-6': 'float-6 21s ease-in-out infinite',
				'float-business': 'float-business 20s ease-in-out infinite',
				'pulse-business': 'pulse-business 3s ease-in-out infinite',
				'slide-up-fade': 'slide-up-fade 0.8s ease-out forwards',
				'scale-in': 'scale-in 0.5s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
