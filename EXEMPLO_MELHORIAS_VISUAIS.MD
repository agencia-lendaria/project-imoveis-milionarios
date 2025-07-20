# EXEMPLO para logo
Utilizar o logo "logo-duomo.png" para colocar na página (inclusive página de login)

# EXEMPLO DE UI (User Interface)
{
  "designSystem": {
    "palette": {
      "primary": "#A55A4A",
      "secondary": "#FFFFFF",
      "accent": "#D4B254",
      "background": "#EAE0D5",
      "text": {
        "light": "#FFFFFF",
        "dark": "#333333"
      }
    },
    "typography": {
      "header": {
        "fontFamily": "'sans-serif'",
        "fontWeight": "normal",
        "fontSize": "1rem"
      },
      "projectLogo": {
        "fontFamily": "'sans-serif'",
        "fontWeight": "bold",
        "fontSize": "2.5rem",
        "textTransform": "uppercase"
      }
    },
    "layout": {
      "container": {
        "maxWidth": "1200px",
        "margin": "0 auto"
      },
      "spacing": {
        "small": "8px",
        "medium": "16px",
        "large": "32px"
      }
    },
    "components": {
      "button": {
        "backgroundColor": "transparent",
        "color": "#FFFFFF",
        "padding": "10px 20px",
        "border": "none",
        "borderRadius": "5px",
        "hover": {
          "color": "#CCCCCC"
        }
      }
    }
  },
  "pageStructure": {
    "header": {
      "componentName": "Header",
      "backgroundColor": "#A55A4A",
      "display": "flex",
      "justifyContent": "space-between",
      "alignItems": "center",
      "padding": "16px 32px",
      "elements": [
        {
          "type": "Logo",
          "content": {
            "src": "main-logo-icon.svg",
            "alt": "Logo da Construtora"
          }
        },
        {
          "type": "Navigation",
          "links": [
            {
              "text": "Sobre nós",
              "href": "/sobre-nos"
            },
            {
              "text": "Empreendimentos",
              "href": "/empreendimentos"
            },
            {
              "text": "Blog",
              "href": "/blog"
            },
            {
              "text": "Contato",
              "href": "/contato"
            }
          ]
        }
      ]
    },
    "mainContent": {
      "componentName": "HeroSectionDuomo",
      "backgroundImage": "url-to-duomo-facade-image.jpg",
      "backgroundSize": "cover",
      "backgroundPosition": "center",
      "position": "relative",
      "minHeight": "85vh",
      "elements": [
        {
          "type": "ProjectLogo",
          "position": "absolute",
          "top": "40px",
          "right": "40px",
          "display": "flex",
          "alignItems": "center",
          "children": [
            {
              "type": "Icon",
              "content": {
                "src": "duomo-logo-icon.svg",
                "alt": "Ícone do Logo Duomo"
              },
              "marginRight": "16px"
            },
            {
              "type": "Text",
              "text": "DUOMO",
              "color": "#333333",
              "style": "projectLogo"
            }
          ]
        }
      ]
    }
  }
}

