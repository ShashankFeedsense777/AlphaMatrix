import re

file_path = '/home/vista-ai-06/AlphaMatrix/src/components/compliances/InvestorGreviance.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Background
content = content.replace('bg-[#060608]', 'bg-gray-50')

# Borders and dividers
content = content.replace('border-white/8', 'border-gray-200')
content = content.replace('divide-white/8', 'divide-gray-200')

# Element backgrounds
content = re.sub(r'bg-white/\[0\.0[34]\]', 'bg-white shadow-sm', content)
content = content.replace('bg-emerald-500/[0.04]', 'bg-emerald-50')
content = content.replace('bg-red-500/[0.04]', 'bg-red-50')

# Text colors (from most specific to least specific)
content = content.replace('text-white/85', 'text-gray-900')
content = content.replace('text-white/80', 'text-gray-800')
content = content.replace('text-white/75', 'text-gray-800')
content = content.replace('text-white/70', 'text-gray-700')
content = content.replace('text-white/65', 'text-gray-700')
content = content.replace('text-white/60', 'text-gray-600')
content = content.replace('text-white/50', 'text-gray-600')
content = content.replace('text-white/45', 'text-gray-500')
content = content.replace('text-white/40', 'text-gray-500')
content = content.replace('text-white/35', 'text-gray-500')
content = content.replace('text-white/30', 'text-gray-400')
content = content.replace('text-white', 'text-gray-900')

# Colored text for light mode
content = content.replace('text-emerald-400', 'text-emerald-600')
content = content.replace('text-red-400', 'text-red-600')
content = content.replace('border-emerald-400/15', 'border-emerald-200')
content = content.replace('border-red-400/15', 'border-red-200')

with open(file_path, 'w') as f:
    f.write(content)

print("Replacement complete.")
