import { motion } from "motion/react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Heart, Home, Settings } from "lucide-react";

export function DesignSystem() {
  const colors = [
    { name: "Midnight Blue", value: "#1C4966", variable: "--midnight-blue" },
    { name: "Healthcare Green", value: "#5F8B70", variable: "--healthcare-green" },
    { name: "Warm Cream", value: "#FFFFF0", variable: "--warm-cream" },
    { name: "Soft Sky Blue", value: "#8FBDD7", variable: "--soft-sky-blue" },
    { name: "Light Mint", value: "#DDEEE3", variable: "--light-mint" },
    { name: "Soft Gray", value: "#F5F7FA", variable: "--soft-gray" },
  ];

  const statusColors = [
    { name: "Success", value: "#5CB85C" },
    { name: "Warning", value: "#F0AD4E" },
    { name: "Danger", value: "#D9534F" },
  ];

  const typography = [
    { name: "Display", size: "32-40px", example: "Relicus App" },
    { name: "Heading", size: "24-28px", example: "Section Heading" },
    { name: "Subheading", size: "18-20px", example: "Subheading Text" },
    { name: "Body", size: "14-16px", example: "Body text content" },
    { name: "Caption", size: "12px", example: "Caption text" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Relicus Design System</h1>
          <p className="text-muted-foreground">Component library and design tokens</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {colors.map((color, index) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: color.value }}
                >
                  <span className="text-white font-semibold text-lg drop-shadow-lg">
                    {color.value}
                  </span>
                </div>
                <div className="bg-card p-3">
                  <p className="font-semibold text-foreground">{color.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{color.variable}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-3">Status Colors</h3>
          <div className="grid grid-cols-3 gap-3">
            {statusColors.map((color) => (
              <div
                key={color.name}
                className="rounded-xl p-4 flex flex-col items-center"
                style={{ backgroundColor: color.value + "20" }}
              >
                <div
                  className="w-12 h-12 rounded-full mb-2"
                  style={{ backgroundColor: color.value }}
                />
                <p className="font-semibold text-sm" style={{ color: color.value }}>
                  {color.name}
                </p>
                <p className="text-xs text-muted-foreground">{color.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Typography</h2>
          <div className="space-y-4">
            {typography.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">{type.name}</span>
                  <span className="text-xs text-muted-foreground">{type.size}</span>
                </div>
                <p
                  className="text-foreground"
                  style={{
                    fontSize: type.name === "Display" ? "32px" :
                             type.name === "Heading" ? "24px" :
                             type.name === "Subheading" ? "18px" :
                             type.name === "Body" ? "16px" : "12px"
                  }}
                >
                  {type.example}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Buttons</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">With Icons</p>
              <div className="flex flex-wrap gap-3">
                <Button>
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button variant="secondary">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Inputs</h2>
          <div className="space-y-4">
            <Input label="Text Input" placeholder="Enter text..." />
            <Input label="Email Input" type="email" placeholder="email@example.com" />
            <Input label="Password Input" type="password" placeholder="Password" />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-foreground mb-2">Basic Card</h3>
              <p className="text-muted-foreground text-sm">
                This is a basic card component with content inside.
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-primary to-secondary text-white">
              <h3 className="font-semibold mb-2">Gradient Card</h3>
              <p className="text-white/90 text-sm">
                Card with gradient background
              </p>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Icons</h2>
          <div className="flex flex-wrap gap-4">
            {[Heart, Home, Settings].map((Icon, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center"
              >
                <Icon className="w-8 h-8 text-primary" />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Spacing</h2>
          <div className="space-y-2">
            {[4, 8, 12, 16, 24, 32].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-16">{size}px</span>
                <div
                  className="bg-primary rounded"
                  style={{ width: `${size}px`, height: "16px" }}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Border Radius</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "Small", value: "8px" },
              { name: "Medium", value: "12px" },
              { name: "Large", value: "16px" },
              { name: "XL", value: "20px" },
              { name: "2XL", value: "24px" },
              { name: "Full", value: "9999px" },
            ].map((radius) => (
              <div key={radius.name} className="text-center">
                <div
                  className="w-20 h-20 bg-gradient-to-br from-primary to-secondary mx-auto mb-2"
                  style={{ borderRadius: radius.value }}
                />
                <p className="text-sm font-semibold text-foreground">{radius.name}</p>
                <p className="text-xs text-muted-foreground">{radius.value}</p>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
