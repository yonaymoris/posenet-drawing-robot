import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'

const Banner = () => {
  const data = useStaticQuery(graphql`
    query {
      photo1: file(relativePath: { eq: "photo.png" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      photo2: file(relativePath: { eq: "photo1.jpeg" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)

  if (!data?.photo1?.childImageSharp?.fluid) {
    return <div>Picture not found</div>
  }

  if (!data?.photo2?.childImageSharp?.fluid) {
    return <div>Picture not found</div>
  }

  return (
    <div className="banner">
      <div className="container">
        <div className="row">
          <div className="side-image left">
            <Img fluid={data.photo2.childImageSharp.fluid} />
          </div>
          <div className="main-text">
            Hello, I am Yona
          </div>
          <div className="main-image">
            <Img fluid={data.photo1.childImageSharp.fluid} />
          </div>
        </div>
        <div className="scroll">
          <span>Scroll down</span>
        </div>
      </div>
      <div className="fixed-misc">Creative Technologist and Designer</div>
    </div>
  )
}

export default Banner
